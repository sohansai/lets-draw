"use client";

export default function BackgroundGraph() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
      {/* Blueprint Grid Structure */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-foreground)_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.06]" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-foreground)_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]" />
      
      {/* Soft gradient mask to blend edges gracefully */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--color-background)_100%)]" />
    </div>
  );
}
