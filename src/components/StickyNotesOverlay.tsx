"use client";
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  StickyNote,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Send,
  X,
  List,
  Target,
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

// Generate unique CSS selector for any hovered DOM element
function getUniqueSelector(el: HTMLElement): { selector: string; tag: string } {
  if (el.id) {
    return { selector: `#${el.id}`, tag: el.tagName };
  }
  const dataTest = el.getAttribute("data-testid") || el.getAttribute("data-section");
  if (dataTest) {
    return { selector: `[data-testid="${dataTest}"]`, tag: el.tagName };
  }

  const parts: string[] = [];
  let curr: HTMLElement | null = el;

  while (curr && curr !== document.body && curr !== document.documentElement) {
    if (curr.id) {
      parts.unshift(`#${curr.id}`);
      break;
    }
    let tag = curr.tagName.toLowerCase();
    const parent: HTMLElement | null = curr.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((c) => c.tagName === curr!.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(curr) + 1;
        tag += `:nth-of-type(${index})`;
      }
    }
    parts.unshift(tag);
    curr = parent;
  }

  const selector = parts.length > 0 ? parts.join(" > ") : el.tagName.toLowerCase();
  return { selector, tag: el.tagName };
}

// Safely query DOM elements without throwing on complex selector syntax
function safeQuerySelector(selector: string): HTMLElement | null {
  if (!selector || selector === "body") return null;
  try {
    const found = document.querySelector(selector);
    if (found) return found as HTMLElement;
  } catch {
    if (selector.startsWith("#")) {
      const idPart = selector.substring(1).split(" ")[0].split(">")[0];
      const byId = document.getElementById(idPart);
      if (byId) return byId;
    }
  }
  return null;
}

export default function StickyNotesOverlay() {
  const pathname = usePathname();
  const [notes, setNotes] = useState<ClientNoteItem[]>([]);
  const [isAddingMode, setIsAddingMode] = useState<boolean>(false);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoverBox, setHoverBox] = useState<{ top: number; left: number; width: number; height: number; tag: string } | null>(null);
  const [dragHoverBox, setDragHoverBox] = useState<{ top: number; left: number; width: number; height: number; tag: string } | null>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "resolved">("open");
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);

  // Fetch active notes for current route & set up real-time listener
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/client-notes?pagePath=${encodeURIComponent(pathname)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notes && data.notes.length > 0) {
          setNotes((prev) => {
            // Keep local unsubmitted drafts while merging fetched notes
            const map = new Map<string, ClientNoteItem>();
            prev.forEach((n) => map.set(n.id, n));
            data.notes.forEach((n: ClientNoteItem) => map.set(n.id, n));
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Fallback
    }
  }, [pathname]);

  useEffect(() => {
    fetchNotes();

    // Supabase Realtime channel subscription
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

  // Instant Add Sticky Note right in front of user in current viewport
  const handleAddInstantNote = () => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    // Direct visible screen placement center-left (Viewport Fixed Coordinates)
    const initialX = Math.round(Math.max(30, viewportWidth / 2 - 144));
    const initialY = 180;

    let elementSelector = "body";
    let elementTag = "BODY";
    let xPct = 50;
    let yPct = 30;

    // Detect center DOM element if possible
    if (typeof document !== "undefined") {
      const pointEl = document.elementFromPoint(viewportWidth / 2, viewportHeight / 3) as HTMLElement | null;
      if (pointEl && !pointEl.closest("#sticky-notes-root") && !pointEl.closest(".sticky-note-card")) {
        const { selector, tag } = getUniqueSelector(pointEl);
        const rect = pointEl.getBoundingClientRect();
        elementSelector = selector;
        elementTag = tag;
        const relX = viewportWidth / 2 - rect.left;
        const relY = viewportHeight / 3 - rect.top;
        xPct = Math.round((relX / rect.width) * 100);
        yPct = Math.round((relY / rect.height) * 100);
        xPct = Number.isNaN(xPct) ? 50 : Math.max(0, Math.min(100, xPct));
        yPct = Number.isNaN(yPct) ? 30 : Math.max(0, Math.min(100, yPct));
      }
    }

    const newNote: ClientNoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      page_path: pathname,
      element_selector: elementSelector,
      element_tag: elementTag,
      note_text: "",
      author_name: "Client Feedback",
      author_role: "client",
      x_offset_pct: xPct,
      y_offset_pct: yPct,
      custom_x: initialX,
      custom_y: initialY,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    setVisible(true);
    handleUpdateNote(newNote);
  };

  // Crosshair Picker Mode
  useEffect(() => {
    if (!isAddingMode) {
      setHoveredEl(null);
      setHoverBox(null);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;

      if (target.closest("#sticky-notes-root") || target.closest(".sticky-note-card")) {
        setHoverBox(null);
        setHoveredEl(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setHoveredEl(target);
      setHoverBox({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        tag: target.tagName.toLowerCase(),
      });
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!hoveredEl) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("#sticky-notes-root") || target?.closest(".sticky-note-card")) return;

      e.preventDefault();
      e.stopPropagation();

      const { selector, tag } = getUniqueSelector(hoveredEl);
      const rect = hoveredEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const xPct = Math.round((clickX / rect.width) * 100);
      const yPct = Math.round((clickY / rect.height) * 100);

      const newNote: ClientNoteItem = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        page_path: pathname,
        element_selector: selector,
        element_tag: tag,
        note_text: "",
        author_name: "Client Feedback",
        author_role: "client",
        x_offset_pct: Number.isNaN(xPct) ? 50 : Math.max(0, Math.min(100, xPct)),
        y_offset_pct: Number.isNaN(yPct) ? 50 : Math.max(0, Math.min(100, yPct)),
        custom_x: Math.round(e.clientX - 144),
        custom_y: Math.round(e.clientY - 30),
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setNotes((prev) => [...prev, newNote]);
      setIsAddingMode(false);
      setHoverBox(null);
      setHoveredEl(null);
      handleUpdateNote(newNote);
    };

    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("click", handlePointerDown, true);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("click", handlePointerDown, true);
    };
  }, [isAddingMode, hoveredEl, pathname]);

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/client-notes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      // Memory fallback
    }
  };

  const handleScrollToNote = (selector: string, noteId: string) => {
    setHighlightedNoteId(noteId);
    try {
      const el = safeQuerySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      // Selector fallback
    }
    setTimeout(() => setHighlightedNoteId(null), 3000);
  };

  return (
    <div id="sticky-notes-root" className="relative">
      {/* Target Element Hover Box (Picker Mode) */}
      {isAddingMode && hoverBox && (
        <div
          className="pointer-events-none absolute z-[99998] border-2 border-amber-400 bg-amber-400/10 rounded shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse transition-all duration-75"
          style={{
            top: `${hoverBox.top}px`,
            left: `${hoverBox.left}px`,
            width: `${hoverBox.width}px`,
            height: `${hoverBox.height}px`,
          }}
        >
          <div className="absolute -top-7 left-0 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
            📍 Target: &lt;{hoverBox.tag}&gt; (Click to Attach Note)
          </div>
        </div>
      )}

      {/* Target Element Hover Box when dragging note */}
      {dragHoverBox && (
        <div
          className="pointer-events-none absolute z-[99997] border-2 border-emerald-400 bg-emerald-400/10 rounded shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse transition-all duration-75"
          style={{
            top: `${dragHoverBox.top}px`,
            left: `${dragHoverBox.left}px`,
            width: `${dragHoverBox.width}px`,
            height: `${dragHoverBox.height}px`,
          }}
        >
          <div className="absolute -top-7 left-0 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
            🧲 Snap Note to: &lt;{dragHoverBox.tag}&gt;
          </div>
        </div>
      )}

      {/* Crosshair Cursor Overlay when crosshair mode active */}
      {isAddingMode && (
        <div className="fixed inset-0 z-[99997] cursor-crosshair pointer-events-none border-4 border-amber-400/40">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 border border-amber-400 text-amber-300 font-mono text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce pointer-events-auto">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Click any element to attach note</span>
            <button
              type="button"
              onClick={() => setIsAddingMode(false)}
              className="ml-2 p-1 rounded-full hover:bg-white/20 text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Render Active Sticky Note Cards */}
      {visible &&
        notes.map((note) => (
          <SingleStickyCard
            key={note.id}
            note={note}
            isHighlighted={highlightedNoteId === note.id}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            setDragHoverBox={setDragHoverBox}
          />
        ))}

      {/* Bottom Right Floating Control Widget */}
      <div className="fixed bottom-5 right-5 z-[99999] flex items-center gap-2 bg-black/90 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={handleAddInstantNote}
          className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-400/50 shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sticky Note</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddingMode(!isAddingMode)}
          title="Pick Element with Crosshair"
          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            isAddingMode ? "bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/50" : "bg-white/5 border-white/15 text-amber-400 hover:bg-white/10"
          }`}
        >
          <Target className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          title={visible ? "Hide Sticky Notes" : "Show Sticky Notes"}
          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            visible ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-red-500/20 border-red-500/40 text-red-300"
          }`}
        >
          {visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
        </button>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
        >
          <List className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Notes</span>
          <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded-full text-[10px] font-black">
            {notes.length}
          </span>
        </button>
      </div>

      {/* Admin Notes Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100000] flex justify-end bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0713] border-l border-white/15 h-full flex flex-col p-6 shadow-2xl space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <StickyNote className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-wider text-white">Client Sticky Notes Log</h3>
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
            <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
              {(["open", "resolved", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg uppercase tracking-wider text-[11px] transition cursor-pointer ${
                    activeFilter === f ? "bg-amber-400 text-black font-black" : "text-white/60 hover:text-white"
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

                acc.push(
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-amber-400/40 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-400 font-bold">&lt;{n.element_tag}&gt;</span>
                      <span className="text-[10px] text-white/40">{n.created_at ? n.created_at.substring(11, 16) : ""}</span>
                    </div>

                    <p className="text-xs text-white/90 font-sans italic">{n.note_text || "(No text written yet)"}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          handleScrollToNote(n.element_selector, n.id);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" /> Go To Element
                      </button>

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
 * Individual Drag-and-Drop Sticky Card Attached to DOM Element
 */
function SingleStickyCard({
  note,
  isHighlighted,
  onUpdate,
  onDelete,
  setDragHoverBox,
}: {
  note: ClientNoteItem;
  isHighlighted: boolean;
  onUpdate: (n: ClientNoteItem) => void;
  onDelete: (id: string) => void;
  setDragHoverBox: (box: { top: number; left: number; width: number; height: number; tag: string } | null) => void;
}) {
  const [text, setText] = useState<string>("");
  const defaultPos = React.useMemo(() => {
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    return {
      left: note.custom_x ?? Math.round(scrollX + Math.max(20, vw / 2 - 144)),
      top: note.custom_y ?? Math.round(scrollY + 200),
    };
  }, [note.custom_x, note.custom_y]);

  const [pos, setPos] = useState<{ left: number; top: number }>(defaultPos);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number }>({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
  const currentHoveredTargetRef = useRef<{ selector: string; tag: string; xPct: number; yPct: number } | null>(null);

  useEffect(() => {
    setText(note.note_text);
  }, [note.note_text]);

  const formattedTime = React.useMemo(() => {
    return note.created_at ? note.created_at.substring(11, 16) : "";
  }, [note.created_at]);

  // Recalculate position relative to target DOM element (Viewport Fixed Coordinates)
  const updatePosition = useCallback(() => {
    if (typeof window === "undefined" || isDragging) return;

    try {
      const targetEl = safeQuerySelector(note.element_selector);
      if (targetEl && targetEl !== document.body) {
        const rect = targetEl.getBoundingClientRect();

        const viewportLeft = Math.round(rect.left + (rect.width * note.x_offset_pct) / 100);
        const viewportTop = Math.round(rect.top + (rect.height * note.y_offset_pct) / 100);

        setPos({ left: viewportLeft, top: viewportTop });
        return;
      }
    } catch {
      // Element not on this page
    }

    // Fallback position directly in viewport center
    if (note.custom_x !== undefined && note.custom_y !== undefined) {
      setPos({ left: note.custom_x, top: note.custom_y });
    } else {
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
      setPos({ left: Math.round(vw / 2 - 144), top: 180 });
    }
  }, [note.element_selector, note.x_offset_pct, note.y_offset_pct, note.custom_x, note.custom_y, isDragging]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    const interval = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearInterval(interval);
    };
  }, [updatePosition]);

  // Drag handler & live element detection
  const handlePointerDown = (e: React.PointerEvent) => {
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
  const setDragHoverBoxRef = useRef(setDragHoverBox);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    noteRef.current = note;
    setDragHoverBoxRef.current = setDragHoverBox;
  });

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newLeft = dragRef.current.initialLeft + dx;
      const newTop = dragRef.current.initialTop + dy;

      setPos({ left: newLeft, top: newTop });

      // Detect element under cursor/drag handle
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (target && !target.closest("#sticky-notes-root") && !target.closest(".sticky-note-card")) {
        const { selector, tag } = getUniqueSelector(target);
        const rect = target.getBoundingClientRect();

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const xPct = Math.round((clickX / rect.width) * 100);
        const yPct = Math.round((clickY / rect.height) * 100);

        currentHoveredTargetRef.current = {
          selector,
          tag,
          xPct: Number.isNaN(xPct) ? 50 : Math.max(0, Math.min(100, xPct)),
          yPct: Number.isNaN(yPct) ? 50 : Math.max(0, Math.min(100, yPct)),
        };

        setDragHoverBoxRef.current({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          tag,
        });
      } else {
        setDragHoverBoxRef.current(null);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDragHoverBoxRef.current(null);

      // Snap & lock sticky note to target DOM element if dropped on one
      if (currentHoveredTargetRef.current) {
        const { selector, tag, xPct, yPct } = currentHoveredTargetRef.current;
        onUpdateRef.current({
          ...noteRef.current,
          element_selector: selector,
          element_tag: tag,
          x_offset_pct: xPct,
          y_offset_pct: yPct,
          custom_x: pos.left,
          custom_y: pos.top,
          updated_at: new Date().toISOString(),
        });
        currentHoveredTargetRef.current = null;
      } else {
        // Save dropped position as custom_x / custom_y fallback
        onUpdateRef.current({
          ...noteRef.current,
          custom_x: pos.left,
          custom_y: pos.top,
          updated_at: new Date().toISOString(),
        });
      }
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
      className={`sticky-note-card fixed z-[99990] w-72 rounded-2xl p-4 bg-[#0c0915]/95 backdrop-blur-2xl border transition-shadow duration-300 ${
        isHighlighted
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
      {/* Note Header / Drag handle */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
            &lt;{note.element_tag}&gt;
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
              note.status === "submitted"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            {note.status === "submitted" ? "✓ Submitted" : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
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
          className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400 transition-colors resize-none font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-white/40 font-mono">
            {formattedTime}
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Submit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}
