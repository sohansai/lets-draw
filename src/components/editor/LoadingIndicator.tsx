'use client'

import { IconLoader2 } from '@tabler/icons-react'

export type LoadingPhase = 'idle' | 'generating' | 'rendering'

interface LoadingIndicatorProps {
  phase: LoadingPhase;
  streamText?: string;
}

export default function LoadingIndicator({ phase, streamText }: LoadingIndicatorProps) {
  if (phase === 'idle') return null

  return (
    <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 flex flex-col gap-2 bg-background/95 backdrop-blur-md border border-border-subtle rounded-xl p-4 shadow-xl pointer-events-none transition-all duration-300">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <IconLoader2 size={14} className="animate-spin text-primary" />
        {phase === 'rendering' ? 'Drawing...' : 'AI is thinking...'}
      </div>
      {phase === 'generating' && streamText && (
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 max-h-32 overflow-hidden relative">
          <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all leading-tight">
            {streamText.slice(-300)}
          </pre>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/95 to-transparent" />
        </div>
      )}
    </div>
  )
}
