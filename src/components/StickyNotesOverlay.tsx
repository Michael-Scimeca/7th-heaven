"use client";
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  StickyNote,
  Plus,
  Eye,
  EyeOff,
  Minus,
  Trash2,
  Send,
  X,
  List,
  Move,
  CornerDownRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface ClientNoteItem {
  id: string;
  page_path: string;
  element_selector: string;
  element_tag: string;
  note_text: string;
  author_name: string;
  author_role: string;
  x_offset_pct: number;
  y_offset_pct: number;
  custom_x?: number;
  custom_y?: number;
  status: "draft" | "submitted" | "resolved";
  created_at: string;
  updated_at: string;
}

export default function StickyNotesOverlay() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<ClientNoteItem[]>([]);
  const [visible, setVisible] = useState<boolean>(true);
  const [hiddenNoteIds, setHiddenNoteIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "resolved">("open");
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);

  // Load saved visibility preferences post-hydration (React Doctor safe)
  useEffect(() => {
    try {
      const savedVisible = localStorage.getItem("7th_heaven_sticky_notes_visible_v1");
      if (savedVisible !== null) {
        setVisible(savedVisible === "true");
      }
      const savedWidgetHidden = localStorage.getItem("7th_heaven_sticky_notes_widget_hidden_v1");
      if (savedWidgetHidden !== null) {
        setIsWidgetHidden(savedWidgetHidden === "true");
      }
      const savedHiddenIds = localStorage.getItem("7th_heaven_hidden_note_ids_v1");
      if (savedHiddenIds) {
        setHiddenNoteIds(JSON.parse(savedHiddenIds));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  const handleToggleWidgetHidden = (hide: boolean) => {
    setIsWidgetHidden(hide);
    try {
      localStorage.setItem("7th_heaven_sticky_notes_widget_hidden_v1", String(hide));
    } catch {
      // LocalStorage fallback
    }
  };

  // Fetch active notes for current route & set up real-time listener
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/client-notes?pagePath=${encodeURIComponent(pathname)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notes) {
          setNotes(data.notes.filter((n: ClientNoteItem) => n.page_path === pathname));
        }
      }
    } catch {
      // Fallback
    }
  }, [pathname]);

  useEffect(() => {
    fetchNotes();

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("client_notes_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "client_notes" }, () => {
          fetchNotes();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore if offline
    }
  }, [fetchNotes]);

  const handleToggleGlobalVisibility = () => {
    const next = !visible;
    setVisible(next);
    try {
      localStorage.setItem("7th_heaven_sticky_notes_visible_v1", String(next));
    } catch {
      // Fallback
    }
  };

  const hiddenNoteSet = React.useMemo(() => new Set(hiddenNoteIds), [hiddenNoteIds]);

  // Save hidden IDs to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem("7th_heaven_hidden_note_ids_v1", JSON.stringify(hiddenNoteIds));
    } catch {
      // LocalStorage fallback
    }
  }, [hiddenNoteIds]);

  const handleToggleHideNote = useCallback((id: string) => {
    setHiddenNoteIds((prev) => {
      const isCurrentlyHidden = prev.includes(id);
      return isCurrentlyHidden ? prev.filter((i) => i !== id) : [...prev, id];
    });
  }, []);

  const handleUpdateNote = async (updatedNote: ClientNoteItem) => {
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));

    try {
      await fetch("/api/client-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
    } catch {
      // Memory fallback
    }
  };

  // Create a new sticky note directly in viewport center for current page
  const handleAddInstantNote = () => {
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    // Page relative coordinates (so it scrolls naturally with page)
    const pageX = Math.round(scrollX + Math.max(30, viewportWidth / 2 - 144));
    const pageY = Math.round(scrollY + 180);

    const newNote: ClientNoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      page_path: pathname,
      element_selector: "body",
      element_tag: "NOTE",
      note_text: "",
      author_name: "Client Feedback",
      author_role: "client",
      x_offset_pct: 50,
      y_offset_pct: 30,
      custom_x: pageX,
      custom_y: pageY,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    if (!visible) {
      handleToggleGlobalVisibility();
    }
    handleUpdateNote(newNote);
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setHiddenNoteIds((prev) => prev.filter((i) => i !== id));
    try {
      await fetch(`/api/client-notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      // Memory fallback
    }
  };

  const handleScrollToNote = (noteId: string) => {
    // Make sure note is unhidden if navigating to it
    if (hiddenNoteSet.has(noteId)) {
      handleToggleHideNote(noteId);
    }
    setHighlightedNoteId(noteId);
    const note = notes.find((n) => n.id === noteId);
    if (note && note.custom_y !== undefined) {
      window.scrollTo({ top: Math.max(0, note.custom_y - 200), behavior: "smooth" });
    }
    setTimeout(() => setHighlightedNoteId(null), 3000);
  };

  return (
    <div id="sticky-notes-root" className="relative">
      {/* Render Active Sticky Note Cards (Strictly filtered by current page_path & hidden state) */}
      {visible &&
        notes.map((note) => {
          if (note.page_path !== pathname) return null;
          if (hiddenNoteSet.has(note.id)) return null;
          return (
            <SingleStickyCard
              key={note.id}
              note={note}
              isHighlighted={highlightedNoteId === note.id}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onHideNote={handleToggleHideNote}
            />
          );
        })}

      {/* Bottom Right Floating Control Widget */}
      {isWidgetHidden ? (
        <button
          type="button"
          onClick={() => handleToggleWidgetHidden(false)}
          title="Show Sticky Notes Toolbar"
          className="fixed bottom-5 right-5 z-[99999] flex items-center gap-1.5 bg-black/90 hover:bg-black backdrop-blur-xl border border-amber-500/40 p-2.5 rounded-full shadow-2xl text-amber-400 hover:text-amber-300 transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <StickyNote className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 pr-1">Sticky Notes</span>
        </button>
      ) : (
        <div className="fixed bottom-5 right-5 z-[99999] flex items-center gap-2 bg-black/90 backdrop-blur-xl border  border-white/10  p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <button
            type="button"
            onClick={handleAddInstantNote}
            className="px-3.5 py-2  rounded-lg text-xs  font-bold  uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-400/50 shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sticky Note</span>
          </button>

          <button
            type="button"
            onClick={handleToggleGlobalVisibility}
            title={visible ? "Hide All Sticky Notes" : "Show All Sticky Notes"}
            className={`p-2  rounded-lg border text-xs font-bold transition cursor-pointer ${visible ? "bg-white/10  border-white/10  text-white hover:bg-white/20" : "bg-red-500/20 border-red-500/40 text-red-300"
              }`}
          >
            {visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3 py-2  rounded-lg bg-[#e1e6ff29]   hover:bg-white/10 border  border-white/20  text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <List className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Notes</span>
            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded-full text-[10px]  font-bold ">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleWidgetHidden(true)}
            title="Minimize Sticky Notes Toolbar"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition cursor-pointer ml-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Notes Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100000] flex justify-end bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0713] border-l  border-white/20  h-full flex flex-col p-6 shadow-2xl space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <StickyNote className="w-5 h-5" />
                <h3 className="text-base  font-bold  uppercase tracking-wider text-white">Client Sticky Notes Log</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-[#e1e6ff29]    rounded-lg border border-white/10 text-xs font-bold">
              {(["open", "resolved", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg uppercase tracking-wider text-[11px] transition cursor-pointer ${activeFilter === f ? "bg-amber-400 text-black  font-bold " : " text-white  hover:text-white"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notes.reduce<React.ReactNode[]>((acc, n) => {
                if (activeFilter === "open" && n.status === "resolved") return acc;
                if (activeFilter === "resolved" && n.status !== "resolved") return acc;

                const isNoteHidden = hiddenNoteSet.has(n.id);

                acc.push(
                  <div
                    key={n.id}
                    className="p-4  rounded-lg bg-white/[0.03] border border-white/10 space-y-2 hover:border-amber-400/40 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold">Sticky Note #{n.id.slice(-4)}</span>
                        {isNoteHidden && (
                          <span className=" text-[12px]   font-bold  text-rose-400 uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40">{n.created_at ? n.created_at.substring(11, 16) : ""}</span>
                    </div>

                    <p className="text-xs text-white/90 font-sans italic">{n.note_text || "(No text written yet)"}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDrawerOpen(false);
                            handleScrollToNote(n.id);
                          }}
                          className="text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" /> Go To Note
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleHideNote(n.id)}
                          className="text-[10px] font-bold uppercase tracking-wider  text-white  hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {isNoteHidden ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-amber-400" />}
                          <span>{isNoteHidden ? "Unhide" : "Hide"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-white/40 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
                return acc;
              }, [])}

              {notes.length === 0 && (
                <div className="py-12 text-center text-white/40 text-xs font-mono">No sticky notes created yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Drag-and-Drop Sticky Card — Zero Snapping Pure Placement
 */
function SingleStickyCard({
  note,
  isHighlighted,
  onUpdate,
  onDelete,
  onHideNote,
}: {
  note: ClientNoteItem;
  isHighlighted: boolean;
  onUpdate: (n: ClientNoteItem) => void;
  onDelete: (id: string) => void;
  onHideNote: (id: string) => void;
}) {
  const [text, setText] = useState<string>("");
  const defaultViewportPos = React.useMemo(() => {
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

    const pageX = note.custom_x ?? Math.round(scrollX + Math.max(30, vw / 2 - 144));
    const pageY = note.custom_y ?? Math.round(scrollY + 180);

    return {
      left: pageX - scrollX,
      top: pageY - scrollY,
    };
  }, [note.custom_x, note.custom_y]);

  const [pos, setPos] = useState<{ left: number; top: number }>(defaultViewportPos);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number }>({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  useEffect(() => {
    setText(note.note_text);
  }, [note.note_text]);

  const formattedTime = React.useMemo(() => {
    return note.created_at ? note.created_at.substring(11, 16) : "";
  }, [note.created_at]);

  // Recalculate position as page scrolls naturally
  const updatePosition = useCallback(() => {
    if (typeof window === "undefined" || isDragging) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const vw = window.innerWidth;

    const pageX = note.custom_x ?? Math.round(scrollX + Math.max(30, vw / 2 - 144));
    const pageY = note.custom_y ?? Math.round(scrollY + 180);

    setPos({
      left: Math.round(pageX - scrollX),
      top: Math.round(pageY - scrollY),
    });
  }, [note.custom_x, note.custom_y, isDragging]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  // Drag handler on entire card
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("textarea") || target.closest("button") || target.closest("a")) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: pos.left,
      initialTop: pos.top,
    };
  };

  const onUpdateRef = useRef(onUpdate);
  const noteRef = useRef(note);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    noteRef.current = note;
  });

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newLeft = dragRef.current.initialLeft + dx;
      const newTop = dragRef.current.initialTop + dy;

      setPos({ left: newLeft, top: newTop });
    };

    const handlePointerUp = () => {
      setIsDragging(false);

      // Save exact page coordinates where user let go
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
      const pageX = Math.round(pos.left + scrollX);
      const pageY = Math.round(pos.top + scrollY);

      onUpdateRef.current({
        ...noteRef.current,
        custom_x: pageX,
        custom_y: pageY,
        updated_at: new Date().toISOString(),
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, pos.left, pos.top]);

  const handleSubmit = () => {
    const updated: ClientNoteItem = {
      ...note,
      note_text: text,
      status: "submitted",
      updated_at: new Date().toISOString(),
    };
    onUpdate(updated);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`sticky-note-card fixed z-[99990] w-72 rounded-2xl p-4 bg-[#0c0915]/95backdrop-blur-[18px]  border transition-shadow duration-300 cursor-grab active:cursor-grabbing ${isHighlighted
        ? "border-amber-300 ring-4 ring-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.8)] scale-105"
        : note.status === "submitted"
          ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          : "border-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
        }`}
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
      }}
    >
      {/* Note Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 select-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 min-w-0 shrink">
          <Move className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 truncate">
            Sticky Note #{note.id.slice(-4)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={` text-[12px]   font-bold  uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${note.status === "submitted"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
          >
            {note.status === "submitted" ? "✓ Submitted" : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => onHideNote(note.id)}
            title="Hide Note"
            className="text-white/40 hover:text-amber-400 p-0.5 transition cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Delete Note"
            className="text-white/40 hover:text-red-400 p-0.5 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Content Textarea */}
      <div className="space-y-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your sticky note message or feedback here..."
          className="w-full bg-[#e1e6ff29]   border border-white/10  rounded-lg p-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400 transition-colors resize-none font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <span className=" text-[12px]  text-white/40 font-mono">
            {formattedTime}
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black  font-bold  text-[10px] uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Submit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}
