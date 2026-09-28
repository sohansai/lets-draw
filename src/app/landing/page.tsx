import MarkerHighlight from '@/components/landing/MarkerHighlight'
import ArchitectureDemo from '@/components/landing/ArchitectureDemo'
import BackgroundGraph from '@/components/landing/BackgroundGraph'
import Navbar from '@/components/landing/Navbar'
import { IconWand } from '@tabler/icons-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans flex flex-col justify-start relative z-0">
      <BackgroundGraph />
      <Navbar />

      <main className="flex-1 w-full flex flex-col relative z-10 pt-20">

        {/* HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-4 md:px-8 pb-0 relative">
          <div className="text-center animate-fade-up" style={{ animationDelay: '0ms' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2 leading-[1.15] max-w-4xl mx-auto">
              Talk through your architecture.<br />
              <span className="text-primary">Watch it draw itself.</span>
            </h1>
          </div>

          <div className="w-full animate-fade-up" style={{ animationDelay: '300ms' }}>
            <ArchitectureDemo />
          </div>
        </section>

        {/* BENTO GRID */}
        <section className="w-full flex flex-col items-center px-4 md:px-8 pt-8 pb-4 relative z-10">
          <div className="w-full max-w-5xl mx-auto flex flex-col justify-center">
            <div className="w-full flex flex-col items-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-center">
                Designed for <MarkerHighlight type="box" delay={1500} color="var(--primary)">speed of thought.</MarkerHighlight>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Bento 1 */}
              <div className="md:col-span-2 relative bg-background border-[3px] border-border shadow-[6px_6px_0_0_var(--color-border)] p-8 overflow-hidden group hover:shadow-[8px_8px_0_0_var(--color-border)] hover:-translate-y-1 transition-all duration-300 min-h-[220px]">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-foreground/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                <h3 className="text-2xl lg:text-3xl font-bold mb-3">Fluent Code-Switching</h3>
                <p className="text-foreground/70 text-lg max-w-sm leading-relaxed">Mix English, Hindi, and technical jargon in the same breath. The AI catches your context natively.</p>
                <div className="relative md:absolute mt-6 md:mt-0 md:bottom-6 md:right-6 flex flex-col md:flex-row gap-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="px-4 py-2 border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] font-hand text-lg bg-background rotate-[-3deg] group-hover:rotate-0 transition-all duration-300 text-accent-coral">&quot;Aur ek database...&quot;</div>
                  <div className="px-4 py-2 border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] font-hand text-lg bg-background rotate-[4deg] group-hover:rotate-0 transition-all duration-300 delay-75 text-primary">&quot;...backed by Redis&quot;</div>
                </div>
              </div>

              {/* Bento 2 */}
              <div className="relative bg-background border-[3px] border-border shadow-[6px_6px_0_0_var(--color-border)] p-8 overflow-hidden group hover:shadow-[8px_8px_0_0_var(--color-border)] hover:-translate-y-1 transition-all duration-300 min-h-[220px]">
                <h3 className="text-2xl font-bold mb-3 relative z-10">Infinite Canvas</h3>
                <p className="text-foreground/70 text-lg relative z-10">Build diagrams as massive as your system.</p>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] group-hover:animate-drift" />
              </div>

              {/* Bento 3 */}
              <div className="relative bg-background border-[3px] border-border shadow-[6px_6px_0_0_var(--color-border)] p-8 overflow-hidden group hover:shadow-[8px_8px_0_0_var(--color-border)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h3 className="text-2xl font-bold mb-3">Instant Layout</h3>
                  <p className="text-foreground/70 text-lg">Nodes route themselves intelligently.</p>
                </div>
                <div className="self-end w-16 h-16 border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] flex items-center justify-center bg-accent-yellow group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out">
                  <IconWand className="w-8 h-8 text-foreground" stroke={2.5} />
                </div>
              </div>

              {/* Bento 4 */}
              <div className="md:col-span-2 relative bg-primary text-white border-[3px] border-border shadow-[6px_6px_0_0_var(--color-border)] p-8 overflow-hidden group hover:shadow-[8px_8px_0_0_var(--color-border)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between min-h-[220px]">
                <div className="z-10">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-3">Export to Anything</h3>
                  <p className="text-white/80 text-lg max-w-sm leading-relaxed">Take your whiteboard to JSON, React Flow, or Markdown seamlessly.</p>
                </div>
                <div className="w-32 h-32 relative mr-4 mt-4 hidden sm:block z-10">
                  <div className="absolute inset-0 border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] bg-background transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500" />
                  <div className="absolute inset-0 border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] bg-background flex items-center justify-center font-mono text-xs group-hover:rotate-6 transition-transform duration-500 text-foreground">
                    <span className="opacity-80">{"{ nodes: [] }"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="w-full text-center text-foreground font-medium py-4 relative z-10">
          <p className="text-foreground/70 text-sm">Built for speed. Designed for thinkers. © 2026 Let&apos;s Draw.</p>
        </footer>
      </main>
    </div>
  )
}
