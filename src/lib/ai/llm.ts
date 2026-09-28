import OpenAI from "openai";
import type { GraphResponse } from "@/types/diagram";
import type { DiagramType, UserProvider } from "@/types/library";
import { getSystemPrompt } from "./prompts";
import { layoutGraph } from "../render/layout";
import { fetchIcons } from "../render/icons";

export type { UserProvider };

export interface ProviderConfig {
  provider: UserProvider;
  apiKey: string; // empty -> Sarvam
}

function resolveClient(config?: ProviderConfig | null): {
  client: OpenAI;
  model: string;
} {
  if (config?.provider === "sarvam") {
    const key = config?.apiKey || process.env.SARVAM_API_KEY || "EMPTY";
    return {
      client: new OpenAI({
        baseURL: "https://api.sarvam.ai/v1",
        apiKey: key,
        defaultHeaders: {
          "api-subscription-key": key
        }
      }),
      model: "sarvam-30b"
    };
  }

  // Default / Google
  const key = config?.apiKey || process.env.GEMINI_API_KEY || "EMPTY";
  return {
    client: new OpenAI({
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      apiKey: key,
    }),
    model: "gemini-3.1-flash-lite-preview"
  };
}

function extractJSON(content: string): string {
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = content.indexOf("{");
  if (start === -1) return content;
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) return content.slice(start, i + 1);
    }
  }
  // truncated stream: best-effort from first `{`
  return content.slice(start);
}

export function generateDiagramStream(
  transcript: string,
  currentGraph?: GraphResponse | null,
  diagramType: DiagramType = "freeform",
  manualEditDebrief?: {
    text: string;
    deletedNodeIds: string[];
    deletedEdgeKeys: Array<{ from: string; to: string }>;
  } | null,
  providerConfig?: ProviderConfig | null,
): ReadableStream {
  const userMessage = currentGraph
    ? `Current diagram:\n${JSON.stringify(currentGraph)}\n\n${manualEditDebrief ? manualEditDebrief.text + "\n\n" : ""}Latest instruction:\n${transcript}`
    : transcript;

  const { client, model } = resolveClient(providerConfig);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: getSystemPrompt(diagramType) },
            { role: "user", content: userMessage },
          ],
          temperature: 0.2,
          max_tokens: 3000,
          stream: true,
        });

        let fullContent = "";

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            fullContent += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        if (!fullContent) throw new Error("LLM returned empty content");

        const jsonStr = extractJSON(fullContent);
        let graph: GraphResponse;

        try {
          graph = JSON.parse(jsonStr) as GraphResponse;
        } catch {
          console.warn("Failed to parse LLM response as JSON:", fullContent);
          if (currentGraph && currentGraph.nodes.length > 0) {
            console.warn("Falling back to current graph");
            const { elements: fbElements, iconRequests: fbRequests } = layoutGraph(currentGraph);
            const fbFiles = fetchIcons(fbRequests);
            const fallbackResult = { elements: fbElements, graph: currentGraph, files: fbFiles, usedFallback: true };
            controller.enqueue(encoder.encode(`\n__FINAL_RESULT__:${JSON.stringify(fallbackResult)}`));
            controller.close();
            return;
          }
          throw new Error("LLM returned empty graph");
        }

        const explicitWipe = /\b(delete|clear|wipe|erase|remove)\s+(every|all)(\s*thing)?\b/i.test(transcript);

        if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) {
          if (currentGraph && currentGraph.nodes.length > 0 && !explicitWipe) {
            graph = currentGraph;
          } else if (!explicitWipe) {
            throw new Error("LLM returned empty graph");
          }
        }

        if (currentGraph && !explicitWipe) {
          const explicitlyRemovedNodes = new Set([
            ...(graph.remove?.nodes ?? []),
            ...(manualEditDebrief?.deletedNodeIds ?? []),
          ]);
          const explicitlyRemovedEdgeKeys = new Set([
            ...(graph.remove?.edges ?? []).map((e) => `${e.from}|${e.to}`),
            ...(manualEditDebrief?.deletedEdgeKeys ?? []).map((e) => `${e.from}|${e.to}`),
          ]);
          const llmNodeIds = new Set(graph.nodes.map((n) => n.id));
          const overlap = currentGraph.nodes.filter((n) => llmNodeIds.has(n.id) || explicitlyRemovedNodes.has(n.id)).length;
          if (overlap > 0) {
            const restoredNodes = currentGraph.nodes.filter((n) => !llmNodeIds.has(n.id) && !explicitlyRemovedNodes.has(n.id));
            const allNodeIds = new Set([...graph.nodes, ...restoredNodes].map((n) => n.id));
            const llmEdgeKeys = new Set(graph.edges.map((e) => `${e.from}|${e.to}`));
            const restoredEdges = (currentGraph.edges ?? []).filter(
              (e) =>
                !llmEdgeKeys.has(`${e.from}|${e.to}`) &&
                !explicitlyRemovedEdgeKeys.has(`${e.from}|${e.to}`) &&
                !explicitlyRemovedNodes.has(e.from) &&
                !explicitlyRemovedNodes.has(e.to) &&
                allNodeIds.has(e.from) &&
                allNodeIds.has(e.to),
            );
            graph = {
              direction: graph.direction ?? currentGraph.direction,
              nodes: [...graph.nodes, ...restoredNodes],
              edges: [...graph.edges, ...restoredEdges],
              groups: graph.groups && graph.groups.length > 0 ? graph.groups : (currentGraph.groups ?? []),
            };
          }
        }

        const { elements, iconRequests } = layoutGraph(graph);
        const files = fetchIcons(iconRequests);
        const finalResult = { elements, graph, files };
        
        controller.enqueue(encoder.encode(`\n__FINAL_RESULT__:${JSON.stringify(finalResult)}`));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error && /401|403|unauthorized|invalid api key/i.test(err.message)
            ? "Missing or invalid API Key. Please check Settings."
            : "Failed to generate diagram. Please try again.";
        controller.enqueue(encoder.encode(`\n__ERROR__:${JSON.stringify({ error: message })}`));
        controller.close();
      }
    }
  });
}
