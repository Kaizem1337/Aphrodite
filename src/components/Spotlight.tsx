"use client";

import type { MouseEvent, ReactNode } from "react";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

export function Spotlight({ children, className = "" }: SpotlightProps) {
  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <div onMouseMove={onMouseMove} className={`glass-panel rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
