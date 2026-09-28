"use client";

import { useEffect, useState, useRef } from "react";
import rough from "roughjs";
import { siNextdotjs, siGraphql, siPostgresql, siRedis, siApachekafka, siDocker } from "simple-icons";
import { IconMicrophone, IconBrain, IconCheck } from "@tabler/icons-react";

type ScenarioNode = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  accentColor: string;
  details: string;
  x: number;
  y: number;
};

const SCENARIO_TEXT = "Build me a real-time AI SaaS: Next.js frontend, GraphQL gateway, Postgres, Redis cache, Kafka event bus, containerised with Docker.";

const SCENARIO_NODES: ScenarioNode[] = [
  { id: "nextjs",   icon: siNextdotjs,  label: "Next.js",   accentColor: "var(--color-foreground)",  details: "SSR Frontend",        x: 30,  y: 110 },
  { id: "graphql",  icon: siGraphql,    label: "GraphQL",   accentColor: "#e535ab",  details: "API Gateway",         x: 220, y: 110 },
  { id: "postgres", icon: siPostgresql, label: "Postgres",  accentColor: "#336791",  details: "Primary Database",    x: 420, y: 30  },
  { id: "redis",    icon: siRedis,      label: "Redis",     accentColor: "#dc382d",  details: "Cache & Sessions",    x: 420, y: 190 },
  { id: "kafka",    icon: siApachekafka,      label: "Kafka",     accentColor: "#f97316",  details: "Event Streaming",     x: 620, y: 110 },
  { id: "docker",   icon: siDocker,     label: "Docker",    accentColor: "#2496ed",  details: "Container Orchestration", x: 750, y: 110 },
];

const SCENARIO_CONNECTIONS = [
  { from: "nextjs",   to: "graphql"  },
  { from: "graphql",  to: "postgres" },
  { from: "graphql",  to: "redis"    },
  { from: "graphql",  to: "kafka"    },
  { from: "kafka",    to: "docker"   },
];

export default function ArchitectureDemo() {
  const [phase, setPhase] = useState<"listening" | "understanding" | "drawing" | "interactive">("listening");
  const [typedCount, setTypedCount] = useState(0);
  const [activeNodes, setActiveNodes] = useState(0);
  const [scale, setScale] = useState(1);
  const [nodeOverrides, setNodeOverrides] = useState<Record<string, {x: number, y: number}>>({});
  
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const arrowsRef = useRef<SVGSVGElement>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive scaling
  useEffect(() => {
    const el = diagramContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setScale(Math.min(1.0, width / 900));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Phase 1: Listening (Typewriter)
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "listening") return;
    const interval = setInterval(() => {
      setTypedCount(c => {
        if (c >= SCENARIO_TEXT.length) {
          clearInterval(interval);
          transitionTimerRef.current = setTimeout(() => setPhase("understanding"), 800);
          return c;
        }
        return c + 1;
      });
    }, 40);
    return () => {
      clearInterval(interval);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [phase]);

  // Phase 2: Understanding
  useEffect(() => {
    if (phase !== "understanding") return;
    const t = setTimeout(() => setPhase("drawing"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 3: Drawing
  useEffect(() => {
    if (phase !== "drawing") return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setActiveNodes(count);
      if (count >= SCENARIO_NODES.length) {
        clearInterval(interval);
        transitionTimerRef.current = setTimeout(() => setPhase("interactive"), 800);
      }
    }, 400);
    return () => {
      clearInterval(interval);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [phase]);

  // Phase 4: Reset cycle (Optional, maybe just keep it interactive)
  useEffect(() => {
    if (phase === "interactive") {
      const t = setTimeout(() => {
        if (Object.keys(nodeOverrides).length > 0) return; // Don't reset if user interacted
        setPhase("listening");
        setTypedCount(0);
        setActiveNodes(0);
        setNodeOverrides({});
        if (arrowsRef.current) arrowsRef.current.innerHTML = "";
      }, 10000); // long delay before restarting
      return () => clearTimeout(t);
    }
  }, [phase, nodeOverrides]);

  // Draw Arrows dynamically
  useEffect(() => {
    if (!arrowsRef.current || activeNodes < 2) return;
    const svgNode = arrowsRef.current;
    svgNode.innerHTML = ""; 
    const rc = rough.svg(svgNode);

    const visibleNodes = new Set(SCENARIO_NODES.slice(0, activeNodes).map(n => n.id));
    const readyConnections = SCENARIO_CONNECTIONS.filter(c => visibleNodes.has(c.from) && visibleNodes.has(c.to));

    readyConnections.forEach((conn, i) => {
      const n1 = SCENARIO_NODES.find(n => n.id === conn.from);
      const n2 = SCENARIO_NODES.find(n => n.id === conn.to);
      if (n1 && n2) {
        const pos1 = nodeOverrides[n1.id] || { x: n1.x, y: n1.y };
        const pos2 = nodeOverrides[n2.id] || { x: n2.x, y: n2.y };
        
        const x1 = pos1.x + 60;
        const y1 = pos1.y + 40;
        const x2 = pos2.x + 60;
        const y2 = pos2.y + 40;
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        
        const gapX = Math.abs(Math.cos(angle)) > 0.5 ? 65 : 35;
        const gapY = Math.abs(Math.sin(angle)) > 0.5 ? 45 : 15;
        
        const startX = x1 + Math.cos(angle) * gapX;
        const startY = y1 + Math.sin(angle) * gapY;
        const endX = x2 - Math.cos(angle) * gapX;
        const endY = y2 - Math.sin(angle) * gapY;

        // Draw rough curve
        const curve = rc.line(startX, startY, endX, endY, {
          stroke: "var(--color-border)",
          strokeWidth: 2,
          roughness: 1.2,
          seed: i + 10
        });
        
        // Data flow animation overlay
        const flowPath = document.createElementNS("http://www.w3.org/2000/svg", "line");
        flowPath.setAttribute("x1", startX.toString());
        flowPath.setAttribute("y1", startY.toString());
        flowPath.setAttribute("x2", endX.toString());
        flowPath.setAttribute("y2", endY.toString());
        flowPath.setAttribute("stroke", "var(--color-primary)");
        flowPath.setAttribute("stroke-width", "3");
        flowPath.classList.add("animate-data-flow");
        flowPath.style.opacity = phase === "interactive" ? "0.6" : "0";
        
        // Draw arrow head
        const arrowSize = 10;
        const leftX = endX - arrowSize * Math.cos(angle - Math.PI / 6);
        const leftY = endY - arrowSize * Math.sin(angle - Math.PI / 6);
        const rightX = endX - arrowSize * Math.cos(angle + Math.PI / 6);
        const rightY = endY - arrowSize * Math.sin(angle + Math.PI / 6);
        
        const arrowLeft = rc.line(endX, endY, leftX, leftY, { stroke: "var(--color-border)", strokeWidth: 2, seed: i + 100 });
        const arrowRight = rc.line(endX, endY, rightX, rightY, { stroke: "var(--color-border)", strokeWidth: 2, seed: i + 200 });
        
        svgNode.appendChild(curve);
        svgNode.appendChild(flowPath);
        svgNode.appendChild(arrowLeft);
        svgNode.appendChild(arrowRight);
      }
    });
  }, [activeNodes, phase, nodeOverrides]);

  const handleDrag = (id: string, dx: number, dy: number) => {
    setNodeOverrides(prev => {
      const current = prev[id] || SCENARIO_NODES.find(n => n.id === id)!;
      return { ...prev, [id]: { x: current.x + dx, y: current.y + dy } };
    });
  };

  const visibleText = SCENARIO_TEXT.slice(0, typedCount);
  
  // Highlight keywords during "understanding" and later phases
    const renderText = () => {
    if (phase === "listening") {
      return <span>{visibleText}<span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse align-middle" /></span>;
    }
    return (
      <span>
        Build me a real-time AI SaaS: <strong className="text-white font-semibold">Next.js frontend</strong>, <strong className="text-[#e535ab] font-semibold">GraphQL gateway</strong>, <strong className="text-[#336791] font-semibold">Postgres</strong>, <strong className="text-[#dc382d] font-semibold">Redis cache</strong>, <strong className="text-foreground/70 font-semibold">Kafka event bus</strong>, containerised with <strong className="text-[#2496ed] font-semibold">Docker</strong>.
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 max-w-4xl mx-auto px-4 md:px-0 mt-2">
      
      {/* Step 1 & 2: Input Area */}
      <div className="w-full bg-background border border-border/20 shadow-xl rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-20">
         <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative transition-colors duration-500">
            {phase === "listening" && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <IconMicrophone className="w-7 h-7 text-primary relative z-10" stroke={2} />
              </>
            )}
            {phase === "understanding" && (
              <IconBrain className="w-7 h-7 text-primary animate-pulse" stroke={2} />
            )}
            {(phase === "drawing" || phase === "interactive") && (
              <IconCheck className="w-7 h-7 text-accent-mint" stroke={2.5} />
            )}
         </div>
         
         <div className="flex-1 flex flex-col min-w-0">
            <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2 flex items-center justify-between">
               <span>
                 {phase === "listening" && "Step 1: Listening..."}
                 {phase === "understanding" && "Step 2: Understanding Concepts..."}
                 {phase === "drawing" && "Step 3: Drawing Architecture..."}
                 {phase === "interactive" && "Step 4: Ready."}
               </span>
               {phase === "interactive" && (
                 <span className="text-primary animate-pulse hidden sm:inline-block">Drag the nodes to interact</span>
               )}
            </div>
            
            <p className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed break-words">
               {renderText()}
            </p>
         </div>
      </div>

      {/* Step 3 & 4: Architecture Canvas */}
      <div 
        ref={diagramContainerRef}
        className={`w-full relative bg-canvas-bg border border-border/20 shadow-xl rounded-xl overflow-hidden z-10 touch-none transition-opacity duration-1000 ${phase === 'listening' ? 'opacity-30' : 'opacity-100'}`}
        style={{ height: 'clamp(280px, 45vw, 360px)' }}
      >
         <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] [background-size:24px_24px]" />
         
         <div 
            style={{
               position: "absolute",
               width: "900px",
               height: "300px",
               left: "50%",
               top: "50%",
               transform: `translate(-50%, -50%) scale(${scale})`,
               transformOrigin: "center center",
            }}
         >
            <svg
               ref={arrowsRef}
               className="absolute inset-0 w-full h-full pointer-events-none z-10"
               viewBox="0 0 900 300"
               preserveAspectRatio="xMidYMid meet"
            />

            {/* Nodes */}
            {SCENARIO_NODES.map((node, index) => {
               const pos = nodeOverrides[node.id] || { x: node.x, y: node.y };
               return (
                 <Node 
                   key={node.id}
                   id={node.id}
                   x={pos.x} y={pos.y} 
                   visible={activeNodes >= index + 1}
                   icon={node.icon}
                   label={node.label}
                   accentColor={node.accentColor}
                   details={node.details}
                   onDrag={handleDrag}
                   scale={scale}
                 />
               );
            })}
         </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Node({ id, x, y, visible, icon, label, accentColor, details, onDrag, scale }: any) {
  const handlePointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    
    let lastX = e.clientX;
    let lastY = e.clientY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - lastX) / scale;
      const dy = (moveEvent.clientY - lastY) / scale;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      onDrag(id, dx, dy);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      el.releasePointerCapture(upEvent.pointerId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.removeEventListener("pointermove", onPointerMove as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.removeEventListener("pointerup", onPointerUp as any);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.addEventListener("pointermove", onPointerMove as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.addEventListener("pointerup", onPointerUp as any);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`absolute w-[120px] h-[80px] bg-background border-2 border-foreground/10 rounded-lg shadow-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out transform group hover:-translate-y-1 hover:shadow-md cursor-grab active:cursor-grabbing z-20 hover:z-50 select-none ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
      style={{ left: x, top: y, touchAction: 'none' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] rounded-lg transition-opacity pointer-events-none" style={{ backgroundColor: accentColor || 'var(--color-primary)' }} />
      <svg
        viewBox="0 0 24 24"
        className="w-8 h-8 transition-colors duration-300 pointer-events-none"
        style={{ color: accentColor || `#${icon.hex}` }}
        fill="currentColor"
      >
        <path d={icon.path} />
      </svg>
      <span className="text-sm font-semibold text-foreground/90 pointer-events-none tracking-tight">
        {label}
      </span>
      
      {/* Interactive Tooltip on Hover */}
      <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded shadow-xl whitespace-nowrap pointer-events-none z-50 ${y > 150 ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
         {details}
         <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 ${y > 150 ? '-bottom-1' : '-top-1'}`} />
      </div>
    </div>
  );
}
