"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ActiveInputDemoPage() {
  const [value, setValue] = useState("Hammani - Google Animation");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="fixed top-6 left-6 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors"
      >
        ← Back
      </Link>

      <div className="w-full max-w-md space-y-3">
        <label className="block text-xs font-bold text-white/60 uppercase tracking-wider">
          Active Input
        </label>
        <div className="input-glow-border rounded-[8px]">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 rounded-[8px] bg-white/10 border-none text-white text-sm font-medium outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}
