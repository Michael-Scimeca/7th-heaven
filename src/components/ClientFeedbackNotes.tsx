"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ClientNote {
  id: string;
  page_path: string;
  content: string;
  x_position: number;
  y_position: number;
  rotation?: number; // visual tilt, computed client-side
}

export default function ClientFeedbackNotes() {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio") || pathname?.startsWith("/api")) {
    return null;
  }
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // Rotation map to persist slight rotation client-side for visual flair
  const [rotations, setRotations] = useState<Record<string, number>>({});

  // Fetch notes for the current page
  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?path=${encodeURIComponent(pathname)}`);
      if (res.ok) {
        const data = await res.json();
        // Compute random rotation for new notes
        const newRotations = { ...rotations };
        const fetchedNotes = (data.notes || []).map((n: ClientNote) => {
          if (!newRotations[n.id]) {
            newRotations[n.id] = (Math.random() * 4) - 2; // rotation between -2 and 2 degrees
          }
          return { ...n, rotation: newRotations[n.id] };
        });
        setRotations(newRotations);
        setNotes(fetchedNotes);
      }
    } catch (err) {
      console.error("Failed to load feedback notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [pathname]);

  const handleAddNote = async () => {
    const id = crypto.randomUUID();
    
    // Position at current viewport center
    const x = window.scrollX + (window.innerWidth / 2) - 120;
    const y = window.scrollY + (window.innerHeight / 2) - 100;

    const newNote: ClientNote = {
      id,
      page_path: pathname,
      content: "",
      x_position: x,
      y_position: y,
      rotation: (Math.random() * 4) - 2
    };

    // Optimistically add to state
    setNotes(prev => [...prev, newNote]);
    setShowNotes(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          page_path: pathname,
          content: "",
          x_position: x,
          y_position: y
        })
      });
      if (!res.ok) {
        fetchNotes();
      }
    } catch {
      fetchNotes();
    }
  };

  const handleUpdateContent = async (id: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  };

  const handleSaveNote = async (note: ClientNote): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          page_path: note.page_path,
          content: note.content,
          x_position: note.x_position,
          y_position: note.y_position
        })
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to save note content:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete note:", err);
      fetchNotes();
    }
  };

  const handleDragEnd = async (note: ClientNote, newX: number, newY: number) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, x_position: newX, y_position: newY } : n));
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          page_path: note.page_path,
          content: note.content,
          x_position: newX,
          y_position: newY
        })
      });
    } catch (err) {
      console.error("Failed to update note position:", err);
    }
  };

  return (
    <>
      {/* Absolute container spanning the page body for notes placement */}
      {showNotes && notes.length > 0 && (
        <div className="absolute top-0 left-0 w-full min-h-full pointer-events-none z-[8888]">
          {notes.map(note => (
            <DraggableNote
              key={note.id}
              note={note}
              onUpdateContent={(content) => handleUpdateContent(note.id, content)}
              onSave={() => handleSaveNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
              onDragEnd={(x, y) => handleDragEnd(note, x, y)}
            />
          ))}
        </div>
      )}

      {/* Floating Manager Widget */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
        {panelOpen && (
          <div className="w-64 bg-[#0a0a16]/95 border border-white/10 p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md animate-[fadeIn_0.2s_ease-out] text-white">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h4 className="text-xs uppercase tracking-widest font-black text-[var(--color-accent)]">Client Feedback</h4>
              <button 
                onClick={() => setPanelOpen(false)}
                className="text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <p className="text-white/60 leading-relaxed">
                Add sticky notes to verify design details or leave comments. Notes auto-save.
              </p>

              <div className="flex items-center justify-between mt-2">
                <span>Show Feedback Notes</span>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    showNotes ? "bg-[var(--color-accent)]" : "bg-white/10"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    showNotes ? "left-5" : "left-1"
                  }`} />
                </button>
              </div>

              <button
                onClick={handleAddNote}
                className="w-full py-2.5 bg-[var(--color-accent)] hover:brightness-110 active:scale-[0.98] transition-all font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(133,29,239,0.3)]"
              >
                ➕ Add Note
              </button>

              <div className="text-2xs text-white/30 text-center mt-1">
                {notes.length} notes on this page
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[#c026d3] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-all duration-300 active:scale-[0.95] cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
        >
          📝 Feedback Control
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

interface DraggableNoteProps {
  note: ClientNote;
  onUpdateContent: (content: string) => void;
  onSave: () => Promise<boolean>;
  onDelete: () => void;
  onDragEnd: (x: number, y: number) => void;
}

function DraggableNote({ note, onUpdateContent, onSave, onDelete, onDragEnd }: DraggableNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; noteX: number; noteY: number } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const triggerSave = async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    const success = await onSave();
    if (success) {
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } else {
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      triggerSave();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.note-header')) {
      // Don't drag if we click the button controls inside the header
      if ((e.target as HTMLElement).closest('button')) return;
      
      e.preventDefault();
      const rect = noteRef.current?.getBoundingClientRect();
      if (!rect) return;

      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        noteX: note.x_position,
        noteY: note.y_position
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    const newX = dragStartRef.current.noteX + dx;
    const newY = dragStartRef.current.noteY + dy;

    if (noteRef.current) {
      noteRef.current.style.left = `${newX}px`;
      noteRef.current.style.top = `${newY}px`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    const newX = dragStartRef.current.noteX + dx;
    const newY = dragStartRef.current.noteY + dy;

    dragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    onDragEnd(newX, newY);
  };

  const getButtonStylesAndText = () => {
    switch (saveStatus) {
      case "saving":
        return {
          text: "Saving...",
          className: "bg-zinc-800 text-zinc-400 border border-zinc-750 cursor-not-allowed"
        };
      case "saved":
        return {
          text: "Saved ✓",
          className: "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-extrabold"
        };
      case "error":
        return {
          text: "Error ✗",
          className: "bg-rose-950/80 text-rose-300 border border-rose-800/80 font-extrabold"
        };
      default:
        return {
          text: "Save",
          className: "bg-zinc-850 text-zinc-100 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-650"
        };
    }
  };

  const buttonStyle = getButtonStylesAndText();

  return (
    <div
      ref={noteRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        left: `${note.x_position}px`,
        top: `${note.y_position}px`,
        transform: `rotate(${note.rotation || 0}deg)`,
      }}
      className="pointer-events-auto absolute w-60 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden select-none transition-all duration-150"
    >
      {/* Header Strip - Grabbable */}
      <div 
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className="note-header h-8 bg-zinc-950 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-zinc-850 select-none"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 select-none">
          <span className="text-zinc-600 text-xs">⋮⋮</span> Client Feedback
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-bold select-none cursor-pointer p-1"
            title={isCollapsed ? "Expand Note" : "Collapse Note"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-zinc-400 hover:text-rose-400 transition-colors text-xs font-bold select-none cursor-pointer p-1"
            title="Delete Note"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Note Content Textarea */}
      {!isCollapsed && (
        <div className="p-3 flex flex-col gap-2">
          <textarea
            value={note.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            onBlur={triggerSave}
            onKeyDown={handleKeyDown}
            placeholder="Type feedback here..."
            className="w-full h-24 bg-zinc-950 border border-zinc-850 p-2 rounded outline-none resize-none text-xs font-medium text-zinc-200 placeholder-zinc-600 leading-relaxed focus:border-zinc-700 transition-colors"
          />

          <div className="flex items-center justify-end select-none">
            <button
              onClick={triggerSave}
              disabled={saveStatus === "saving"}
              className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 select-none cursor-pointer shadow-sm ${buttonStyle.className}`}
            >
              {buttonStyle.text}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
