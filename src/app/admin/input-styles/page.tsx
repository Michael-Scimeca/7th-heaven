"use client";

import React, { useState } from "react";
import InputStyleEditor from "@/components/InputStyleEditor";
import Link from "next/link";
import { Sliders, Sparkles, ArrowLeft, Check, Copy } from "lucide-react";

export default function InputStylesPage() {
  const [formData, setFormData] = useState({
    name: "Michael Scimeca",
    org: "7th Heaven Management",
    email: "michael@7thheavenband.com",
    phone: "(555) 123-4567",
    eventType: "full_band",
    loadIn: "3:00 PM (2 hrs prior)",
    venue: "House of Blues",
    city: "Chicago",
    state: "IL",
    notes: "Please include full PA system setup and sound check at 4:30 PM.",
  });

  return (
    <div className="min-h-screen bg-[#05030a] text-white pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link href="/book" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Booking Form
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400">
              Form Input Style Studio
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Customize background blur, fill opacity, borders, corner radii, and focus glow in real time across the entire site.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Live CSS Variables
            </span>
          </div>
        </div>

        {/* CSS Rule Location Notice */}
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-3">
          <Sliders className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs text-white/70 space-y-1">
            <p className="font-bold text-white uppercase tracking-wider">Style Control Location:</p>
            <p>Global CSS design variables for input styling are controlled in <code className="bg-black/60 px-2 py-0.5 rounded text-cyan-300 font-mono">src/app/globals.css</code> (lines 110–145) under <code className="bg-black/60 px-2 py-0.5 rounded text-cyan-300 font-mono">:root</code>.</p>
            <p>Use the floating <strong className="text-cyan-300">Input Style Controls</strong> editor button at the bottom-left to adjust fill opacity, blur, borders, and glow live on screen!</p>
          </div>
        </div>

        {/* Live Form Preview Section */}
        <div className="bg-[#0c0817]/90 backdrop-blur-2xl border border-cyan-500/30 p-8 rounded-3xl space-y-6 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-cyan-400">Live Form Input Preview</h2>
            <p className="text-xs text-white/50">Test focus states and typing responsiveness with your active CSS variables.</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">FULL NAME *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input w-full"
                placeholder="Enter full name..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">ORGANIZATION</label>
              <input
                type="text"
                value={formData.org}
                onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                className="form-input w-full"
                placeholder="Venue or company name..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">EMAIL ADDRESS *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input w-full"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">PHONE NUMBER</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input w-full"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">EVENT TYPE SELECT</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="form-input w-full cursor-pointer"
              >
                <option value="full_band" className="bg-[#0c0817] text-white">Full Band (5-Piece)</option>
                <option value="unplugged" className="bg-[#0c0817] text-white">Unplugged Acoustic</option>
                <option value="private" className="bg-[#0c0817] text-white">Private Event</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">VENUE CITY *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input w-full"
                placeholder="Chicago"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">NOTES & SPECIAL REQUESTS</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-input w-full resize-none"
              placeholder="Describe event details..."
            />
          </div>
        </div>

      </div>

      {/* Editor Drawer Tool */}
      <InputStyleEditor />
    </div>
  );
}
