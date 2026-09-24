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
import { useMember } from "@/context/MemberContext";

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
  const { member } = useMember();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notes, setNotes] = useState<ClientNoteItem[]>([]);
  const [visible, setVisible] = useState<boolean>(true);
  const [hiddenNoteIds, setHiddenNoteIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "resolved">(
    "open",
  );
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const isRoleAdmin = member?.role === "admin";
    const isPathAdmin = pathname?.startsWith("/admin");
    const isCookieAdmin =
      typeof document !== "undefined" &&
      document.cookie.includes("admin_authenticated=true");
    const isQueryAdmin =
      typeof window !== "undefined" &&
      window.location.search.includes("admin=true");
    setIsAdmin(
      Boolean(isRoleAdmin || isPathAdmin || isCookieAdmin || isQueryAdmin),
    );
  }, [member, pathname]);

  // Load saved visibility preferences post-hydration (React Doctor safe)
  useEffect(() => {
    try {
      const savedVisible = localStorage.getItem(
        "7th_heaven_sticky_notes_visible_v1",
      );
      if (savedVisible !== null) {
        setVisible(savedVisible === "true");
      }
      const savedWidgetHidden = localStorage.getItem(
        "7th_heaven_sticky_notes_widget_hidden_v1",
      );
      if (savedWidgetHidden !== null) {
        setIsWidgetHidden(savedWidgetHidden === "true");
      }
      const savedHiddenIds = localStorage.getItem(
        "7th_heaven_hidden_note_ids_v1",
      );
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
      localStorage.setItem(
        "7th_heaven_sticky_notes_widget_hidden_v1",
        String(hide),
      );
    } catch {
      // LocalStorage fallback
    }
  };

  // Fetch active notes for current route & set up real-time listener
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/client-notes?pagePath=${encodeURIComponent(pathname)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.notes) {
          setNotes(
            data.notes.filter((n: ClientNoteItem) => n.page_path === pathname),
          );
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
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "client_notes" },
          () => {
            fetchNotes();
          },
        )
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

  const hiddenNoteSet = React.useMemo(
    () => new Set(hiddenNoteIds),
    [hiddenNoteIds],
  );

  // Save hidden IDs to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(
        "7th_heaven_hidden_note_ids_v1",
        JSON.stringify(hiddenNoteIds),
      );
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
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );

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
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;

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
      await fetch(`/api/client-notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
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
      window.scrollTo({
        top: Math.max(0, note.custom_y - 200),
        behavior: "smooth",
      });
    }
    setTimeout(() => setHighlightedNoteId(null), 3000);
  };

  if (!isAdmin) return null;

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
          className="fixed right-5 bottom-5 z-[99999] flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/40 bg-black/90 p-2.5 text-amber-400 backdrop-blur-xl transition-[background-color,color,transform] hover:scale-110 hover:bg-black hover:text-amber-300 active:scale-95"
        >
          <StickyNote className="h-4 w-4 text-amber-400" />
          <span className="pr-1 text-[10px] text-amber-300">Sticky Notes</span>
        </button>
      ) : (
        <div className="fixed right-5 bottom-5 z-[99999] flex items-center gap-2 rounded-2xl border border-white/10 bg-black/90 p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <button
            type="button"
            onClick={handleAddInstantNote}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 shadow-amber-500/20 transition-[background-color,transform,box-shadow] hover:from-amber-400 hover:to-amber-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sticky Note</span>
          </button>

          <button
            type="button"
            onClick={handleToggleGlobalVisibility}
            title={visible ? "Hide All Sticky Notes" : "Show All Sticky Notes"}
            className={`cursor-pointer rounded-lg border p-2 ${visible ? "border-white/10 bg-white/10 hover:bg-white/20" : "border-red-500/40 bg-red-500/20 text-red-300"}`}
          >
            {visible ? (
              <Eye className="h-4 w-4 text-emerald-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-red-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-[#00000029] px-3 py-2 hover:bg-white/10"
          >
            <List className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Notes</span>
            <span className="rounded-lg bg-amber-400 px-1.5 py-0.5 text-[10px]">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleWidgetHidden(true)}
            title="Minimize Sticky Notes Toolbar"
            className="ml-0.5 cursor-pointer rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Admin Notes Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100000] flex justify-end bg-black/70 backdrop-blur-md">
          <div className="flex h-full w-full max-w-md flex-col space-y-6 overflow-hidden border-l border-white/10 bg-[#0a0713] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <StickyNote className="h-5 w-5" />
                <h3>Client Sticky Notes Log</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="cursor-pointer rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 rounded-lg border border-white/10 bg-[#00000029] p-1">
              {(["open", "resolved", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`flex-1 cursor-pointer rounded-lg py-1.5 ${activeFilter === f ? "bg-amber-400" : "hover:text-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {notes.reduce<React.ReactNode[]>((acc, n) => {
                if (activeFilter === "open" && n.status === "resolved")
                  return acc;
                if (activeFilter === "resolved" && n.status !== "resolved")
                  return acc;

                const isNoteHidden = hiddenNoteSet.has(n.id);

                acc.push(
                  <div
                    key={n.id}
                    className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:border-amber-400/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">
                          Sticky Note #{n.id.slice(-4)}
                        </span>
                        {isNoteHidden && (
                          <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[12px] text-rose-400">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40">
                        {n.created_at ? n.created_at.substring(11, 16) : ""}
                      </span>
                    </div>

                    <p>{n.note_text || "(No text written yet)"}</p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDrawerOpen(false);
                            handleScrollToNote(n.id);
                          }}
                          className="flex cursor-pointer items-center gap-1 text-[10px] text-amber-300 hover:text-white"
                        >
                          <CornerDownRight className="h-3 w-3" /> Go To Note
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleHideNote(n.id)}
                          className="flex cursor-pointer items-center gap-1 text-[10px] hover:text-white"
                        >
                          {isNoteHidden ? (
                            <Eye className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-amber-400" />
                          )}
                          <span>{isNoteHidden ? "Unhide" : "Hide"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        className="cursor-pointer p-1 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>,
                );
                return acc;
              }, [])}

              {notes.length === 0 && (
                <div className="py-12 text-center text-white/40">
                  No sticky notes created yet.
                </div>
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

    const pageX =
      note.custom_x ?? Math.round(scrollX + Math.max(30, vw / 2 - 144));
    const pageY = note.custom_y ?? Math.round(scrollY + 180);

    return {
      left: pageX - scrollX,
      top: pageY - scrollY,
    };
  }, [note.custom_x, note.custom_y]);

  const [pos, setPos] = useState<{ left: number; top: number }>(
    defaultViewportPos,
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  }>({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

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

    const pageX =
      note.custom_x ?? Math.round(scrollX + Math.max(30, vw / 2 - 144));
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
    if (
      target.closest("textarea") ||
      target.closest("button") ||
      target.closest("a")
    )
      return;
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
      className={`sticky-note-card bg-[#0c0915]/95backdrop-blur-xl fixed z-[99990] w-72 cursor-grab rounded-2xl border p-4 transition-shadow active:cursor-grabbing ${isHighlighted ? "scale-105 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.8)] ring-4 ring-amber-400/50" : note.status === "submitted" ? "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]"}`}
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
      }}
    >
      {/* Note Header */}
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 select-none">
        <div className="flex min-w-0 shrink items-center gap-1.5 text-amber-400">
          <Move className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className="text-[10px] text-amber-300">
            Sticky Note #{note.id.slice(-4)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`shrink-0 rounded-lg px-2 py-0.5 text-[12px] whitespace-nowrap ${note.status === "submitted" ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300" : "border border-amber-500/40 bg-amber-500/20 text-amber-300"}`}
          >
            {note.status === "submitted" ? "✓ Submitted" : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => onHideNote(note.id)}
            title="Hide Note"
            className="cursor-pointer p-0.5 text-white/40 hover:text-amber-400"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Delete Note"
            className="cursor-pointer p-0.5 text-white/40 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
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
          className="form-input focus-ring resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px] text-white/40">{formattedTime}</span>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-[10px] shadow-amber-400/20 hover:bg-amber-300"
          >
            <Send className="h-3 w-3" />
            <span>Submit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}
