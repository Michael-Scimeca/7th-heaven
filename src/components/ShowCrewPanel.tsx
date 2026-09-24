/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
import { useState } from "react";
import {
  Users,
  Clock,
  Guitar,
  FileText,
  Sparkles,
  Check,
  Square,
  X,
} from "lucide-react";

const CREW_ROLES = [
  "Sound",
  "Lights",
  "Merch",
  "Roadie",
  "Stage Tech",
  "FOH",
  "Photography",
  "Video",
  "DJ",
  "Other",
] as const;

const DEFAULT_GEAR = [
  "PA System (Mains + Subs)",
  "Monitor Wedges",
  "Mic Package",
  "DI Boxes",
  "Mic Stands",
  "Guitar Amps",
  "Bass Amp",
  "Drum Kit / Hardware",
  "Stage Lighting Rig",
  "Fog / Haze Machine",
  "Cables & Snakes",
  "Merch Table + Banner",
];

interface CrewMember {
  name: string;
  role: string;
  confirmed: boolean;
}

interface TimelineEvent {
  label: string;
  time: string;
}

interface GearItem {
  name: string;
  loaded: boolean;
}

interface LogisticsNote {
  text: string;
  author: string;
  time: string;
}

interface ShowCrewData {
  crew: CrewMember[];
  timeline: TimelineEvent[];
  gear: GearItem[];
  notes: LogisticsNote[];
}

export default function ShowCrewPanel({
  bookingId,
  eventDate,
  venueName,
}: {
  bookingId: string;
  eventDate: string;
  venueName: string;
}) {
  const [data, setData] = useState<ShowCrewData>({
    crew: [],
    timeline: [
      { label: "Load-in", time: "" },
      { label: "Soundcheck", time: "" },
      { label: "Doors", time: "" },
      { label: "Showtime", time: "" },
      { label: "Load-out", time: "" },
    ],
    gear: DEFAULT_GEAR.map((g) => ({ name: g, loaded: false })),
    notes: [],
  });

  const [addingCrew, setAddingCrew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<string>(CREW_ROLES[0]);
  const [newNote, setNewNote] = useState("");
  const [addingGear, setAddingGear] = useState(false);
  const [newGearName, setNewGearName] = useState("");
  const [activeSection, setActiveSection] = useState<
    "crew" | "timeline" | "gear" | "notes"
  >("crew");

  const addCrew = () => {
    if (!newName.trim()) return;
    setData((prev) => ({
      ...prev,
      crew: [
        ...prev.crew,
        { name: newName.trim(), role: newRole, confirmed: false },
      ],
    }));
    setNewName("");
    setAddingCrew(false);
  };

  const toggleConfirm = (i: number) => {
    setData((prev) => ({
      ...prev,
      crew: prev.crew.map((c, idx) =>
        idx === i ? { ...c, confirmed: !c.confirmed } : c,
      ),
    }));
  };

  const removeCrew = (i: number) => {
    setData((prev) => ({
      ...prev,
      crew: prev.crew.filter((_, idx) => idx !== i),
    }));
  };

  const updateTimeline = (i: number, time: string) => {
    setData((prev) => ({
      ...prev,
      timeline: prev.timeline.map((t, idx) => (idx === i ? { ...t, time } : t)),
    }));
  };

  const toggleGear = (i: number) => {
    setData((prev) => ({
      ...prev,
      gear: prev.gear.map((g, idx) =>
        idx === i ? { ...g, loaded: !g.loaded } : g,
      ),
    }));
  };

  const removeGear = (i: number) => {
    setData((prev) => ({
      ...prev,
      gear: prev.gear.filter((_, idx) => idx !== i),
    }));
  };

  const addGearItem = () => {
    if (!newGearName.trim()) return;
    setData((prev) => ({
      ...prev,
      gear: [...prev.gear, { name: newGearName.trim(), loaded: false }],
    }));
    setNewGearName("");
    setAddingGear(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setData((prev) => ({
      ...prev,
      notes: [
        {
          text: newNote.trim(),
          author: "Band Manager",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev.notes,
      ],
    }));
    setNewNote("");
  };

  const confirmedCount = data.crew.filter((c) => c.confirmed).length;
  const gearLoaded = data.gear.filter((g) => g.loaded).length;
  const gearPct =
    data.gear.length > 0
      ? Math.round((gearLoaded / data.gear.length) * 100)
      : 0;

  const tabs = [
    {
      id: "crew" as const,
      label: "Crew",
      count: `${confirmedCount}/${data.crew.length}`,
      Icon: Users,
    },
    {
      id: "timeline" as const,
      label: "Schedule",
      count:
        data.timeline.filter((t) => t.time).length + "/" + data.timeline.length,
      Icon: Clock,
    },
    { id: "gear" as const, label: "Gear", count: `${gearPct}%`, Icon: Guitar },
    {
      id: "notes" as const,
      label: "Notes",
      count: String(data.notes.length),
      Icon: FileText,
    },
  ];

  return (
    <div className="overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <span>Show Crew — {bookingId}</span>
            <span className="ml-2 text-white/30">
              {eventDate} · {venueName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--font-size-2xs)] text-white/20">
            Headcount:
          </span>
          <span
            className={`${confirmedCount > 0 ? "text-emerald-400" : "text-white/30"}`}
          >
            {confirmedCount}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => {
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-4 py-2.5 ${activeSection === tab.id ? "border-b-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "text-white/50 hover:bg-white/[0.02] hover:text-white"}`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
              <span
                className={`ml-1 rounded px-1.5 py-0.5 text-[var(--font-size-2xs)] ${activeSection === tab.id ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]" : "bg-[#00000029] text-white/30"}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* CREW ROSTER */}
        {activeSection === "crew" && (
          <div>
            {data.crew.length === 0 && !addingCrew ? (
              <div className="py-8 text-center">
                <p className="mb-3">No crew assigned yet</p>
                <button
                  onClick={() => setAddingCrew(true)}
                  className="cursor-pointer text-[var(--color-accent)]"
                >
                  + Add First Crew Member
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 space-y-1.5">
                  {Array.from(data.crew, (c, i) => ({ c, i })).map(
                    ({ c, i }) => (
                      <div
                        key={c.name || i}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${c.confirmed ? "border-emerald-500/15 bg-emerald-500/5" : "border-white/5 bg-white/[0.01]"}`}
                      >
                        <button
                          onClick={() => toggleConfirm(i)}
                          className="shrink-0 cursor-pointer"
                          title={c.confirmed ? "Confirmed" : "Click to confirm"}
                        >
                          {c.confirmed ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Square className="/15 h-4 w-4" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`${c.confirmed ? " " : "text-white/40"}`}
                          >
                            {c.name}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-[var(--font-size-2xs)] ${c.confirmed ? "border border-[var(--color-accent)]/30 bg-emerald-500/15" : "border border-[var(--color-accent)]/15 bg-[var(--color-accent)]/10 text-[var(--color-accent)]/60"}`}
                        >
                          {c.role}
                        </span>
                        <button
                          onClick={() => removeCrew(i)}
                          className="shrink-0 cursor-pointer text-white/10 hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ),
                  )}
                </div>

                {addingCrew ? (
                  <div className="flex items-end gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex-1">
                      <label
                        htmlFor="show-crew-new-name"
                        className="mb-1 block text-[var(--font-size-2xs)] text-white/30"
                      >
                        Name
                      </label>
                      <input
                        id="show-crew-new-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCrew()}
                        autoFocus
                        placeholder="Crew member name"
                        className="placeholder: /15 focus-ring w-full rounded-lg border border-white/10 px-3 py-2 outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="show-crew-new-role"
                        className="mb-1 block text-[var(--font-size-2xs)] text-white/30"
                      >
                        Role
                      </label>
                      <select
                        id="show-crew-new-role"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="focus-ring rounded-lg border border-white/10 px-3 py-2 [color-scheme:dark] outline-none"
                      >
                        {CREW_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={addCrew}
                      className="shrink-0 cursor-pointer rounded-lg bg-[var(--color-accent)] px-3 py-2 hover:bg-[var(--color-accent)]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingCrew(false)}
                      className="shrink-0 cursor-pointer py-2 text-white/30 text-white/50 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingCrew(true)}
                    className="cursor-pointer text-[var(--color-accent)]/60"
                  >
                    + Add Crew
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {activeSection === "timeline" && (
          <div className="space-y-2">
            {Array.from(data.timeline, (event, i) => ({ event, i })).map(
              ({ event, i }) => (
                <div
                  key={event.label}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2"
                >
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-lg border-2 ${event.time ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-white/10"}`}
                    />
                    {i < data.timeline.length - 1 && (
                      <div className="absolute top-3.5 h-6 w-px bg-[#00000029]" />
                    )}
                  </div>
                  <span className="w-24 shrink-0 text-white/50">
                    {event.label}
                  </span>
                  <input
                    type="text"
                    value={event.time}
                    onChange={(e) => updateTimeline(i, e.target.value)}
                    placeholder="e.g. 3:00 PM"
                    className="placeholder: focus-ring flex-1 border-b border-white/10 px-1 py-1 text-white/10 outline-none"
                  />
                </div>
              ),
            )}
          </div>
        )}

        {/* GEAR CHECKLIST */}
        {activeSection === "gear" && (
          <div>
            {/* Progress bar */}
            <div className="mb-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-lg bg-[#00000029]">
                <div
                  className={`h-full rounded-lg ${gearPct === 100 ? "bg-emerald-500" : gearPct >= 50 ? "bg-purple-600" : "bg-rose-500"}`}
                  style={{ width: `${gearPct}%` }}
                />
              </div>
              <span
                className={`${gearPct === 100 ? "text-emerald-400" : "text-white/30"}`}
              >
                {gearLoaded}/{data.gear.length} loaded
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Array.from(data.gear, (item, i) => ({ item, i })).map(
                ({ item, i }) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${item.loaded ? "border-emerald-500/10 bg-emerald-500/5" : "border-white/5 bg-white/[0.01]"}`}
                  >
                    <button
                      onClick={() => toggleGear(i)}
                      className="shrink-0 cursor-pointer"
                    >
                      {item.loaded ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Square className="/15 h-3.5 w-3.5" />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${item.loaded ? "text-white/50 line-through" : " "}`}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() => removeGear(i)}
                      className="shrink-0 cursor-pointer text-[var(--font-size-2xs)] text-white/10 hover:text-rose-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              )}
            </div>
            <div className="mt-3">
              {addingGear ? (
                <div className="flex gap-2">
                  <input
                    value={newGearName}
                    onChange={(e) => setNewGearName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGearItem()}
                    autoFocus
                    placeholder="Gear item name"
                    className="placeholder: /15 focus-ring flex-1 rounded-lg border border-white/10 px-3 py-1.5 outline-none"
                  />
                  <button
                    onClick={addGearItem}
                    className="cursor-pointer px-2 text-[var(--color-accent)]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingGear(false)}
                    className="cursor-pointer px-1 text-white/30"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingGear(true)}
                  className="cursor-pointer text-[var(--color-accent)]/60"
                >
                  + Add Gear
                </button>
              )}
            </div>
          </div>
        )}

        {/* LOGISTICS NOTES */}
        {activeSection === "notes" && (
          <div>
            <div className="mb-3 flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add a note... (parking info, power drops, venue contact, etc.)"
                className="placeholder: /15 focus-ring flex-1 rounded-lg border border-white/10 px-3 py-2 outline-none"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="shrink-0 cursor-pointer rounded-lg bg-[var(--color-accent)] px-3 py-2 hover:bg-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Post
              </button>
            </div>
            {data.notes.length === 0 ? (
              <div className="/15 py-6 text-center">
                No notes yet — add logistics info for the crew
              </div>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {data.notes.map((note) => (
                  <div
                    key={note.text}
                    className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                  >
                    <p>{note.text}</p>
                    <div className=".5 flex items-center gap-2">
                      <span className="text-[var(--color-accent)]/50 text-[var(--font-size-2xs)]">
                        {note.author}
                      </span>
                      <span className="/15 text-[var(--font-size-2xs)]">·</span>
                      <span className="text-[var(--font-size-2xs)] text-white/20">
                        {note.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
