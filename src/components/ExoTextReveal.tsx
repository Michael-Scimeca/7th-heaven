"use client";

import React, { ElementType } from "react";

interface ExoTextRevealProps {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
}

export default function ExoTextReveal({
  children,
  as: Component = "h2",
  className = "",
}: ExoTextRevealProps) {
  // Split text string into lines by newline
  const lineArray = children.split("\n").filter(Boolean);
  const Tag = Component as any;

  return (
    <Tag className={`exo-text-reveal ${className}`}>
      {lineArray.map((line) => (
        <span
 key={`line-${line}`}
 className="exo-text-line-wrap block overflow-hidden py-[0.05em] transform-gpu"
 >
          <span className="exo-text-line-inner block transform-gpu">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
