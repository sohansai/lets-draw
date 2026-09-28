"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IconSend } from "@tabler/icons-react";
import MicButton from "./MicButton";
import InterimIndicator from "./InterimIndicator";
import VersionTimeline, { type VersionTimelineHandle } from "./VersionTimeline";
import { useVoice } from "@/hooks/editor/useVoice";
import type { ExcalidrawCanvasHandle } from "@/components/editor/ExcalidrawCanvas";
import type { ExcalidrawElement } from "@/types/diagram";
import type { DiagramType } from "@/types/library";

export interface VoicePanelHandle {
  focusInput: () => void;
  navigatePrev: () => void;
  navigateNext: () => void;
}

interface VoicePanelProps {
  diagramId: string;
  diagramType: DiagramType;
  isLoading: boolean;
  onSilence: (transcript: string) => void;
  onMockSubmit?: (text: string) => void;
  onMicStart?: () => void;
  onMicStop?: () => void;
  canvasRef: React.RefObject<ExcalidrawCanvasHandle | null>;
  onRestoreAnimation: () => void;
  pauseSave: (liveElements: ExcalidrawElement[]) => void;
  resumeSave: () => void;
  onError?: (msg: string) => void;
}

const VoicePanel = forwardRef<VoicePanelHandle, VoicePanelProps>(
  function VoicePanel(
    {
      diagramId,
      diagramType,
      isLoading,
      onSilence,
      onMockSubmit,
      onMicStart,
      onMicStop,
      canvasRef,
      onRestoreAnimation,
      pauseSave,
      resumeSave,
      onError,
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<VersionTimelineHandle>(null);
    const [mockInput, setMockInput] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      focusInput() {
        inputRef.current?.focus();
      },
      navigatePrev() {
        timelineRef.current?.navigatePrev();
      },
      navigateNext() {
        timelineRef.current?.navigateNext();
      },
    }));

    const handleSilence = (transcript: string) => {
      setMessages((prev) => [...prev, transcript]);
      onSilence(transcript);
    };

    const {
      status,
      isListening,
      interimTranscript,
      finalTranscript,
      start,
      stop,
      reset,
    } = useVoice(
      handleSilence,
      diagramType === "system-architecture",
      onError,
    );

    const handleToggle = () => {
      if (isListening) {
        stop();
        onMicStop?.();
      } else {
        reset();
        onMicStart?.();
        start();
      }
    };

    const submitMock = () => {
      if (!mockInput.trim()) return;
      const text = mockInput.trim();
      setMessages((prev) => [...prev, text]);
      onMockSubmit?.(text);
      setMockInput("");
    };

    return (
      <div className="flex flex-col h-full bg-background border-l border-border text-foreground transition-colors">
        <VersionTimeline
          ref={timelineRef}
          diagramId={diagramId}
          canvasRef={canvasRef}
          onRestoreAnimation={onRestoreAnimation}
          pauseSave={pauseSave}
          resumeSave={resumeSave}
        />

        <div className="flex flex-col items-center gap-2 pt-5 pb-3">
          <MicButton isListening={isListening} onClick={handleToggle} />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-subtle text-xs">
              {status === "reconnecting"
                ? "Reconnecting to speech service..."
                : isListening
                ? "Click to end recording and generate"
                : isLoading
                  ? "Drawing..."
                  : "Click to start"}
            </span>
            <p className="text-placeholder text-xs">
              Just talk. Your diagram builds itself.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="py-3 space-y-2 px-4">
            {messages.length === 0 && !finalTranscript && (
              <div className="hidden lg:contents">
                <p className="text-placeholder text-xs px-1 pb-1">
                  Try an example:
                </p>
                {[
                  {
                    label: "React → Node API → Postgres & Redis",
                    prompt:
                      "React frontend calls a Node API, which reads from Postgres and caches in Redis",
                  },
                  {
                    label: "Form validation flow",
                    prompt:
                      "User submits a form, it gets validated, if valid send a confirmation email, if not show an error",
                  },
                  {
                    label: "Order fulfillment process",
                    prompt:
                      "Customer places an order, warehouse picks and packs it, courier delivers it, customer confirms receipt",
                  },
                ].map(({ label, prompt }) => (
                  <button
                    key={label}
                    disabled={isLoading || isListening}
                    onClick={() => {
                      setMessages((prev) => [...prev, prompt]);
                      onMockSubmit?.(prompt);
                    }}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface text-muted hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className="bg-canvas-bg border border-border shadow-sm rounded-lg p-3 text-foreground text-sm leading-relaxed whitespace-pre-wrap mb-2"
              >
                {msg}
              </div>
            ))}
            {finalTranscript && (
              <div className="bg-canvas-bg border border-primary/30 shadow-sm rounded-lg p-3 text-foreground text-sm leading-relaxed whitespace-pre-wrap mb-2">
                {finalTranscript}
              </div>
            )}
            {interimTranscript && (
              <div className="bg-canvas-bg/50 border border-border border-dashed shadow-sm rounded-lg p-3 text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap mb-2">
                <InterimIndicator text={interimTranscript} />
              </div>
            )}
          </div>
        </div>

        {onMockSubmit && (
          <div className="px-4 py-2 border-t border-border-subtle flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 text-sm bg-surface border border-border rounded-lg px-3 py-2 text-foreground placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Or type a description…"
              value={mockInput}
              onChange={(e) => setMockInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitMock();
              }}
            />
            <button
              onClick={submitMock}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center justify-center"
            >
              <IconSend size={15} />
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default VoicePanel;
