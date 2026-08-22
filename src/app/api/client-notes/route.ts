import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export interface ClientNote {
  id: string;
  page_path: string;
  element_selector: string;
  element_tag?: string;
  note_text: string;
  author_name: string;
  author_role?: string;
  x_offset_pct: number;
  y_offset_pct: number;
  custom_x?: number;
  custom_y?: number;
  status: "draft" | "submitted" | "resolved";
  created_at: string;
  updated_at: string;
}

// In-memory fallback store for development/instant mode
const memoryNotesStore: Map<string, ClientNote> = new Map();

/**
 * GET /api/client-notes
 * Query params:
 *  - pagePath: filter by route (optional)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pagePath = searchParams.get("pagePath");

  try {
    const supabase = createClient();
    let query = supabase.from("client_notes").select("*").order("created_at", { ascending: true });

    if (pagePath) {
      query = query.eq("page_path", pagePath);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json({ notes: data });
    }
  } catch (err) {
    console.warn("Supabase fetch fallback for client notes:", err);
  }

  // Return memory store notes
  const allNotes = Array.from(memoryNotesStore.values());
  const filtered = pagePath ? allNotes.filter((n) => n.page_path === pagePath) : allNotes;
  return NextResponse.json({ notes: filtered });
}

/**
 * POST /api/client-notes
 * Create or update a sticky note
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ClientNote>;
    if (!body.id || !body.page_path || !body.element_selector) {
      return NextResponse.json({ error: "Missing required fields: id, page_path, element_selector" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const noteObj: ClientNote = {
      id: body.id,
      page_path: body.page_path,
      element_selector: body.element_selector,
      element_tag: body.element_tag || "DIV",
      note_text: body.note_text || "",
      author_name: body.author_name || "Client Note",
      author_role: body.author_role || "client",
      x_offset_pct: body.x_offset_pct ?? 50,
      y_offset_pct: body.y_offset_pct ?? 50,
      custom_x: body.custom_x,
      custom_y: body.custom_y,
      status: body.status || "submitted",
      created_at: body.created_at || now,
      updated_at: now,
    };

    // Save to memory store
    memoryNotesStore.set(noteObj.id, noteObj);

    // Try saving to Supabase client_notes table if present
    try {
      const supabase = createClient();
      await supabase.from("client_notes").upsert([noteObj]);
    } catch {
      // Memory fallback is active
    }

    return NextResponse.json({ note: noteObj, success: true });
  } catch (err) {
    console.error("Error creating/updating client note:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/client-notes
 * Query params:
 *  - id: note ID to resolve or delete
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
  }

  memoryNotesStore.delete(id);

  try {
    const supabase = createClient();
    await supabase.from("client_notes").delete().eq("id", id);
  } catch {
    // Silent fallback
  }

  return NextResponse.json({ success: true, deletedId: id });
}
