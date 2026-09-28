"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Preload Excalidraw bundle in the background for instant loading
    if (typeof window !== "undefined") {
      import("@excalidraw/excalidraw").catch(() => {});
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b-[3px] border-border shadow-sm py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg md:text-xl tracking-tight flex items-center gap-2 group">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-primary text-white flex items-center justify-center border-2 border-border font-hand transform text-sm md:text-base group-hover:-rotate-12 transition-transform">L</div>
          Let&apos;s Draw
        </Link>

        <div className="flex items-center gap-4">
          <Link 
            href="/d/new" 
            className="px-3 md:px-5 py-1.5 md:py-2 bg-primary text-white font-semibold text-sm md:text-base border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-border)] active:translate-y-1 active:shadow-none transition-all"
          >
            Start drawing <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
