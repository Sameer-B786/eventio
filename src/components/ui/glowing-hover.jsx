"use client";

import * as React from "react";
import { cn } from "cn";

export function GlowingHoverEffect({
  children,
  className,
  glowColor = "rgba(138, 43, 226, 0.85)", // Made significantly brighter
  size = 400,
}) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    container.addEventListener("pointermove", handlePointerMove);
    
    // Set initial position off-screen so the glow isn't visible until hover
    container.style.setProperty("--mouse-x", `-1000px`);
    container.style.setProperty("--mouse-y", `-1000px`);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative group overflow-hidden rounded-xl", className)}
      style={{
        "--glow-size": `${size}px`,
        "--glow-color": glowColor,
      }}
    >
      {/* Background glow that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(var(--glow-size) circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 100%)`,
        }}
      />
      
      {/* Content wrapper with a slight inner background to create the border-only glow effect, or just lay content on top */}
      <div className="relative z-10 w-full h-full bg-card/90 backdrop-blur-sm m-[1px] rounded-xl h-[calc(100%-2px)] w-[calc(100%-2px)]">
        {children}
      </div>
    </div>
  );
}

export function GlowingBorderCard({
  children,
  className,
  ...props
}) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    container.addEventListener("pointermove", handlePointerMove);
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group rounded-xl bg-card border border-border/50",
        className
      )}
      {...props}
    >
      {/* 
        The mask-image approach based on modern web guidance for revealing interactive content. 
        It masks a bright gradient background so it only shows up around the mouse cursor as a border glow.
      */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `linear-gradient(to right, #a855f7, #ec4899, #3b82f6)`, // Neon purple, pink, blue for maximum brightness
          maskImage: `radial-gradient(
            250px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            black,
            transparent 100%
          )`,
          WebkitMaskImage: `radial-gradient(
            250px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            black,
            transparent 100%
          )`,
        }}
      />
      <div className="relative z-10 w-full h-full bg-card rounded-xl">
        {children}
      </div>
    </div>
  );
}
