import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ShowPageClient from "./ShowPageClient";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: show } = await supabase.from("shows").select("venue_name, city, state, date").eq("id", id).single();
  if (!show) return { title: "Show — 7th Heaven" };
  const dateStr = new Date(show.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return {
    title: `${show.venue_name} — 7th Heaven`,
    description: `7th Heaven live at ${show.venue_name} in ${show.city}, ${show.state} on ${dateStr}. See who's going and RSVP!`,
  };
}

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch show details
  const { data: show } = await supabase
    .from("shows")
    .select("*")
    .eq("id", id)
    .single();

  if (!show) notFound();

  // Fetch attendees
  const { data: attendees } = await supabase
    .from("show_attendance")
    .select(`
      id,
      status,
      checked_in_at,
      profiles (
        id,
        full_name,
        profile_photo_url,
        tier
      )
    `)
    .eq("show_id", id)
    .order("created_at", { ascending: false });

  return <ShowPageClient show={show} initialAttendees={attendees || []} />;
}
