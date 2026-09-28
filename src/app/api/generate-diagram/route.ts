import { NextRequest } from 'next/server'
import { generateDiagramStream } from "@/lib/ai/llm"
import type { ProviderConfig } from '@/lib/ai/llm'
import type { GraphResponse } from '@/types/diagram'
import type { DiagramType } from '@/types/library'
import { TEMPLATES } from '@/lib/templates'
import { layoutGraph } from '@/lib/render/layout'
import { fetchIcons } from '@/lib/render/icons'

export const maxDuration = 60;

const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_TRANSCRIPT_LENGTH = 10_000;
const MAX_GRAPH_NODES = 500;
const MAX_GRAPH_EDGES = 1_000;

class RequestTooLargeError extends Error {}

async function readRequestJson(request: NextRequest): Promise<unknown> {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        throw new RequestTooLargeError('request body is too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(bytes));
}

function isAuthError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  // OpenAI SDK folds 401/403 into message text
  return msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('invalid api key')
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: 'request body is too large' }, { status: 413 });
    }

    let body: {
      transcript?: string
      currentGraph?: GraphResponse
      diagramType?: DiagramType
      manualEditDebrief?: { text: string; deletedNodeIds: string[]; deletedEdgeKeys: Array<{ from: string; to: string }> }
      providerConfig?: ProviderConfig
    }

    try {
      body = (await readRequestJson(request)) as typeof body;
    } catch (error) {
      if (error instanceof RequestTooLargeError) {
        return Response.json({ error: error.message }, { status: 413 });
      }
      return Response.json(
        { error: 'request body must be valid JSON' },
        { status: 400 }
      )
    }

    if (typeof body.transcript !== 'string' || !body.transcript.trim()) {
      return Response.json(
        { error: 'transcript is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (body.transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return Response.json(
        { error: `transcript must be ${MAX_TRANSCRIPT_LENGTH} characters or fewer` },
        { status: 413 },
      );
    }

    if (body.currentGraph) {
      if (
        !Array.isArray(body.currentGraph.nodes) ||
        !Array.isArray(body.currentGraph.edges) ||
        body.currentGraph.nodes.length > MAX_GRAPH_NODES ||
        body.currentGraph.edges.length > MAX_GRAPH_EDGES
      ) {
        return Response.json({ error: 'current graph is too large or malformed' }, { status: 413 });
      }
    }

    if (body.providerConfig) {
      const validProviders = new Set(['google', 'sarvam']);
      if (
        !validProviders.has(body.providerConfig.provider) ||
        typeof body.providerConfig.apiKey !== 'string' ||
        body.providerConfig.apiKey.length > 500
      ) {
        return Response.json({ error: 'provider configuration is invalid' }, { status: 400 });
      }
    }

    if (body.transcript.startsWith('@template:')) { const templateId = body.transcript.split(':')[1]; const template = TEMPLATES[templateId]; if (!template) return Response.json({ error: 'Template not found' }, { status: 404 }); const { elements, iconRequests } = layoutGraph(template.graph); const files = fetchIcons(iconRequests); return Response.json({ elements, graph: template.graph, files }); }

    const args = [body.transcript, body.currentGraph, body.diagramType, body.manualEditDebrief] as const

    try {
      const stream = generateDiagramStream(...args, body.providerConfig); return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
      
    } catch (err) {
      // bad BYOK → retry on server Sarvam
      if (isAuthError(err) && body.providerConfig?.apiKey) {
        const stream = generateDiagramStream(...args, null); return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
        
      }
      throw err
    }
  } catch (error) {
    if (isAuthError(error)) { return Response.json({ error: 'Missing or invalid API Key. Please enter your API Key in Settings.' }, { status: 401 }) }
    if (error instanceof Error && error.message.includes('empty graph')) {
      return Response.json({ skipped: true })
    }
    if (error instanceof Error && error.message.includes('timeout')) {
      return Response.json({ error: 'LLM request timed out' }, { status: 503 })
    }

    console.error('generate-diagram error:', error)
    return Response.json({ error: 'Failed to generate diagram' }, { status: 500 })
  }
}
