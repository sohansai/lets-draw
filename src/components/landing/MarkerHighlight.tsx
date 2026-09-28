"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export default function MarkerHighlight({ 
  children, 
  delay = 0, 
  type = "underline",
  color = "#1e1e1e"
}: { 
  children: React.ReactNode, 
  delay?: number, 
  type?: "underline" | "circle" | "box",
  color?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    // Clear previous if re-rendered
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const timer = setTimeout(() => {
      const rc = rough.svg(svg);
      const { width, height } = svg.getBoundingClientRect();
      
      let node;
      if (type === "underline") {
        node = rc.line(0, height - 4, width, height - 4, { stroke: color, strokeWidth: 5, roughness: 2.5, bowing: 1.5 });
      } else if (type === "circle") {
        node = rc.ellipse(width/2, height/2, width + 16, height + 16, { stroke: color, strokeWidth: 4, roughness: 2 });
      } else {
        node = rc.rectangle(-4, -4, width + 8, height + 8, { stroke: color, strokeWidth: 4, roughness: 2 });
      }
      
      // Animate draw using the global CSS animation
      node.classList.add("animate-ink-draw");
      svg.appendChild(node);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, type, color]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0" />
    </span>
  );
}
