"use client";

import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import type { DiagramType } from "@/types/library";
import { TEMPLATES } from "@/lib/templates";

const DIAGRAM_TYPES: {
  value: DiagramType;
  label: string;
  description: string;
}[] = [
  {
    value: "freeform",
    label: "Freeform",
    description: "Any diagram - architecture, org charts, mind maps",
  },
  {
    value: "system-architecture",
    label: "System Architecture",
    description: "Microservices, APIs, databases, and infrastructure",
  },
  {
    value: "operations-flowchart",
    label: "Operations Flowchart",
    description: "Business processes, approvals, and decision trees",
  },
];

interface Props {
  onConfirm: (name: string, diagramType: DiagramType, templateId?: string) => void;
  onCancel: () => void;
}

export default function NewDiagramModal({ onConfirm, onCancel }: Props) {
  const [tab, setTab] = useState<"blank" | "template">("blank");
  const [name, setName] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType>("freeform");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("aws-serverless");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "blank") {
      onConfirm(name.trim() || "Untitled Diagram", diagramType);
    } else {
      const template = TEMPLATES[selectedTemplate];
      onConfirm(name.trim() || template.label, "system-architecture", selectedTemplate);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div className="bg-background border border-border-subtle rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-foreground font-semibold text-base">
            New Diagram
          </h2>
          <button
            onClick={onCancel}
            className="text-subtle hover:text-foreground transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
        
        <div className="flex border-b border-border-subtle px-6">
          <button type="button" onClick={() => setTab("blank")} className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${tab === "blank" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>Blank Canvas</button>
          <button type="button" onClick={() => setTab("template")} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === "template" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>Templates</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-sm">Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tab === "template" ? TEMPLATES[selectedTemplate].label : "Untitled Diagram"}
              className="bg-background border border-border focus:border-primary outline-none rounded-md px-3 py-2 text-foreground text-sm placeholder-placeholder transition-colors"
            />
          </div>

          {tab === "blank" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-sm">Type</label>
              <div className="grid grid-cols-1 gap-2">
                {DIAGRAM_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setDiagramType(type.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-colors ${
                      diagramType === type.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border-subtle bg-background text-muted hover:border-placeholder"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{type.label}</span>
                      <span className="text-xs text-placeholder">
                        {type.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-sm">Template</label>
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto">
                {Object.entries(TEMPLATES).map(([id, t]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedTemplate(id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-colors ${
                      selectedTemplate === id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border-subtle bg-background text-muted hover:border-placeholder"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className="text-xs text-placeholder">
                        {t.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-subtle hover:text-foreground transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
            >
              Create Diagram
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
