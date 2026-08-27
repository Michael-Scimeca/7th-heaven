"use client";

import React from "react";

interface ProgressiveBlurProps {
  position?: "top" | "bottom" | "both";
  className?: string;
}

export default function ProgressiveBlur({ position = "both", className = "" }: ProgressiveBlurProps) {
  return (
    <>
      {(position === "top" || position === "both") && (
        <div className={`progressive-blur is-top ${className}`} aria-hidden="true">
          <div className="progressive-blur__layer is--1" />
          <div className="progressive-blur__layer is--2" />
          <div className="progressive-blur__layer is--3" />
          <div className="progressive-blur__layer is--4" />
          <div className="progressive-blur__layer is--5" />
        </div>
      )}

      {(position === "bottom" || position === "both") && (
        <div className={`progressive-blur is-bottom ${className}`} aria-hidden="true">
          <div className="progressive-blur__layer is--1" />
          <div className="progressive-blur__layer is--2" />
          <div className="progressive-blur__layer is--3" />
          <div className="progressive-blur__layer is--4" />
          <div className="progressive-blur__layer is--5" />
        </div>
      )}
    </>
  );
}
