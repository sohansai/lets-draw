"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useVoice(
  onSilence: (transcript: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _boostTechTerms = false,
  onError?: (msg: string) => void
) {
  const [status, setStatus] = useState<"idle" | "listening" | "reconnecting">("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef("");
  
  const onSilenceRef = useRef(onSilence);
  useEffect(() => {
    onSilenceRef.current = onSilence;
  }, [onSilence]);

  const teardown = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    setStatus("idle");
    setInterimTranscript("");
  }, []);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      const text = finalTranscriptRef.current.trim();
      if (text.length > 3) {
        onSilenceRef.current(text);
      }
      finalTranscriptRef.current = "";
      setFinalTranscript("");
    }, 2500);
  }, []);

  const start = useCallback(() => {
    teardown();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    
    recognition.onstart = () => {
      setStatus("listening");
      resetSilenceTimer();
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      if (final) {
        finalTranscriptRef.current = (finalTranscriptRef.current + " " + final).trim();
        setFinalTranscript(finalTranscriptRef.current);
      }
      
      setInterimTranscript(interim);
      resetSilenceTimer();
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        onError?.("Microphone access denied.");
      }
      teardown();
    };
    
    recognition.onend = () => {
      setStatus("idle");
    };
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      teardown();
    }
  }, [teardown, resetSilenceTimer, onError]);

  const stop = useCallback(() => {
    const text = finalTranscriptRef.current.trim();
    if (text.length > 3) {
      onSilenceRef.current(text);
    }
    teardown();
    finalTranscriptRef.current = "";
    setFinalTranscript("");
  }, [teardown]);

  const reset = useCallback(() => {
    finalTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  return {
    status,
    isListening: status === "listening",
    interimTranscript,
    finalTranscript,
    start,
    stop,
    reset,
  };
}
