"use client";
import { useState } from "react";
import { Users, Clock, Guitar, FileText, Sparkles, Check, Square, X } from "lucide-react";

const CREW_ROLES = ["Sound", "Lights", "Merch", "Roadie", "Stage Tech", "FOH", "Photography", "Video", "DJ", "Other"] as const;

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

export default function ShowCrewPanel({ bookingId, eventDate, venueName }: { bookingId: string; eventDate: string; venueName: string }) {
  const [data, setData] = useState<ShowCrewData>({
    crew: [],
    timeline: [
      { label: "Load-in", time: "" },
      { label: "Soundcheck", time: "" },
      { label: "Doors", time: "" },
      { label: "Showtime", time: "" },
      { label: "Load-out", time: "" },
    ],
    gear: DEFAULT_GEAR.map(g => ({ name: g, loaded: false })),
    notes: [],
  });

  const [addingCrew, setAddingCrew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<string>(CREW_ROLES[0]);
  const [newNote, setNewNote] = useState("");
  const [addingGear, setAddingGear] = useState(false);
  const [newGearName, setNewGearName] = useState("");
  const [activeSection, setActiveSection] = useState<"crew" | "timeline" | "gear" | "notes">("crew");

  const addCrew = () => {
    if (!newName.trim()) return;
    setData(prev => ({ ...prev, crew: [...prev.crew, { name: newName.trim(), role: newRole, confirmed: false }] }));
    setNewName("");
    setAddingCrew(false);
  };

  const toggleConfirm = (i: number) => {
    setData(prev => ({
      ...prev,
      crew: prev.crew.map((c, idx) => idx === i ? { ...c, confirmed: !c.confirmed } : c),
    }));
  };

  const removeCrew = (i: number) => {
    setData(prev => ({ ...prev, crew: prev.crew.filter((_, idx) => idx !== i) }));
  };

  const updateTimeline = (i: number, time: string) => {
    setData(prev => ({
      ...prev,
      timeline: prev.timeline.map((t, idx) => idx === i ? { ...t, time } : t),
    }));
  };

  const toggleGear = (i: number) => {
    setData(prev => ({
      ...prev,
      gear: prev.gear.map((g, idx) => idx === i ? { ...g, loaded: !g.loaded } : g),
    }));
  };

  const removeGear = (i: number) => {
    setData(prev => ({ ...prev, gear: prev.gear.filter((_, idx) => idx !== i) }));
  };

  const addGearItem = () => {
    if (!newGearName.trim()) return;
    setData(prev => ({ ...prev, gear: [...prev.gear, { name: newGearName.trim(), loaded: false }] }));
    setNewGearName("");
    setAddingGear(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setData(prev => ({
      ...prev,
      notes: [{ text: newNote.trim(), author: "Band Manager", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev.notes],
    }));
    setNewNote("");
  };

  const confirmedCount = data.crew.filter(c => c.confirmed).length;
  const gearLoaded = data.gear.filter(g => g.loaded).length;
  const gearPct = data.gear.length > 0 ? Math.round((gearLoaded / data.gear.length) * 100) : 0;

  const tabs = [
    { id: "crew" as const, label: "Crew", count: `${confirmedCount}/${data.crew.length}`, Icon: Users },
    { id: "timeline" as const, label: "Schedule", count: data.timeline.filter(t => t.time).length + "/" + data.timeline.length, Icon: Clock },
    { id: "gear" as const, label: "Gear", count: `${gearPct}%`, Icon: Guitar },
    { id: "notes" as const, label: "Notes", count: String(data.notes.length), Icon: FileText },
  ];

  return (
    <div className="border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-bold text-white/80">Show Crew — {bookingId}</span>
            <span className="text-white/30 ml-2">{eventDate} · {venueName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--font-size-2xs)] font-bold text-white/20 uppercase   ">Headcount:</span>
          <span className={`font-bold ${confirmedCount > 0 ? 'text-emerald-400' : 'text-white/30'}`}>{confirmedCount}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map(tab => {
          const TabIcon = tab.Icon;
          return (
            <button aria-label="Action button"
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 px-4 py-2.5 font-bold uppercase    transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${activeSection === tab.id ? ' text-[var(--color-accent)] bg-[var(--color-accent)]/5 border-b-2 border-[var(--color-accent)]'
                : 'text-white/25 hover:text-white/50 hover:bg-white/[0.02]'
                }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[var(--font-size-2xs)] font-bold ${activeSection === tab.id ? 'bg-[var(--color-accent)]/20  text-[var(--color-accent)]' : ' bg-[#00000029]    text-white/30'}`}>{tab.count}</span>
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
              <div className="text-center py-8">
                <p className="mb-3">No crew assigned yet</p>
                <button aria-label="Action button" onClick={() => setAddingCrew(true)} className="font-bold uppercase    text-[var(--color-accent)] hover: text-[var(--color-accent)] cursor-pointer transition-colors">+ Add First Crew Member</button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 mb-3">
                  {Array.from(data.crew, (c, i) => ({ c, i })).map(({ c, i }) => (
                    <div key={c.name || i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${c.confirmed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.01] border-white/5'}`}>
                      <button aria-label="Action button" onClick={() => toggleConfirm(i)} className="cursor-pointer shrink-0" title={c.confirmed ? 'Confirmed' : 'Click to confirm'}>
                        {c.confirmed ? <Check className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-white/15" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`font-bold ${c.confirmed ? 'text-white/70' : 'text-white/40'}`}>{c.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[var(--font-size-2xs)] font-bold uppercase tracking-wider shrink-0 ${c.confirmed ? 'bg-emerald-500/15 text-[var(--color-accent)] border  border-[var(--color-accent)]/30' : 'bg-[var(--color-accent)]/10  text-[var(--color-accent)]/60 border border-[var(--color-accent)]/15'}`}>{c.role}</span>
                      <button aria-label="Action button" onClick={() => removeCrew(i)} className="text-white/10 hover:text-rose-400 cursor-pointer transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>

                {addingCrew ? (
                  <div className="flex gap-2 items-end bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <div className="flex-1">
                      <label htmlFor="show-crew-new-name" className="text-[var(--font-size-2xs)] uppercase    text-white/30 font-bold block mb-1">Name</label>
                      <input aria-label="Input field" id="show-crew-new-name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCrew()} autoFocus placeholder="Crew member name" className="w-full border border-white/10 px-3 py-2 rounded-lg text-white placeholder:text-white/15 outline-none focus:border-[var(--color-accent)]" />
                    </div>
                    <div>
                      <label htmlFor="show-crew-new-role" className="text-[var(--font-size-2xs)] uppercase    text-white/30 font-bold block mb-1">Role</label>
                      <select aria-label="Select option" id="show-crew-new-role" value={newRole} onChange={e => setNewRole(e.target.value)} className="border border-white/10 px-3 py-2 rounded-lg text-white outline-none focus:border-[var(--color-accent)] [color-scheme:dark]">
                        {CREW_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <button aria-label="Action button" onClick={addCrew} className="px-3 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shrink-0">Add</button>
                    <button aria-label="Action button" onClick={() => setAddingCrew(false)} className="text-white/30 hover:text-white/50 cursor-pointer shrink-0 py-2"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button aria-label="Action button" onClick={() => setAddingCrew(true)} className="font-bold uppercase    text-[var(--color-accent)]/60 hover: text-[var(--color-accent)] cursor-pointer transition-colors">+ Add Crew</button>
                )}
              </>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {activeSection === "timeline" && (
          <div className="space-y-2">
            {Array.from(data.timeline, (event, i) => ({ event, i })).map(({ event, i }) => (
              <div key={event.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] border border-white/5">
                <div className="relative flex flex-col items-center shrink-0">
                  <div className={`w-3 h-3 rounded-lg border-2 ${event.time ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'bg-transparent   border-white/10  '}`} />
                  {i < data.timeline.length - 1 && <div className="w-px h-6 bg-[#00000029] absolute top-3.5" />}
                </div>
                <span className="font-bold text-white/50 w-24 shrink-0">{event.label}</span>
                <input aria-label="Input field"
                  type="text"
                  value={event.time}
                  onChange={e => updateTimeline(i, e.target.value)}
                  placeholder="e.g. 3:00 PM"
                  className="flex-1 bg-transparent border-b border-white/5 focus:border-[var(--color-accent)]/50 text-white px-1 py-1 outline-none placeholder:text-white/10 transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {/* GEAR CHECKLIST */}
        {activeSection === "gear" && (
          <div>
            {/* Progress bar */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-[#00000029] rounded-lg overflow-hidden">
                <div className={`h-full rounded-lg transition-colors ${gearPct === 100 ? 'bg-emerald-500' : gearPct >= 50 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${gearPct}%` }} />
              </div>
              <span className={`font-bold ${gearPct === 100 ? 'text-emerald-400' : 'text-white/30'}`}>{gearLoaded}/{data.gear.length} loaded</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Array.from(data.gear, (item, i) => ({ item, i })).map(({ item, i }) => (
                <div key={item.name} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors ${item.loaded ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/[0.01] border-white/5'}`}>
                  <button aria-label="Action button" onClick={() => toggleGear(i)} className="cursor-pointer shrink-0">
                    {item.loaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-white/15" />}
                  </button>
                  <span className={`flex-1 truncate ${item.loaded ? 'text-white/50 line-through' : ' text-white '}`}>{item.name}</span>
                  <button aria-label="Action button" onClick={() => removeGear(i)} className="text-white/10 hover:text-rose-400 text-[var(--font-size-2xs)] cursor-pointer transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              {addingGear ? (
                <div className="flex gap-2">
                  <input aria-label="Input field" value={newGearName} onChange={e => setNewGearName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGearItem()} autoFocus placeholder="Gear item name" className="flex-1 border border-white/10 px-3 py-1.5 rounded-lg text-white placeholder:text-white/15 outline-none focus:border-[var(--color-accent)]" />
                  <button aria-label="Action button" onClick={addGearItem} className="text-[var(--color-accent)] font-bold uppercase tracking-wider cursor-pointer px-2">Add</button>
                  <button aria-label="Action button" onClick={() => setAddingGear(false)} className="text-white/30 cursor-pointer px-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button aria-label="Action button" onClick={() => setAddingGear(true)} className="font-bold uppercase    text-[var(--color-accent)]/60 hover: text-[var(--color-accent)] cursor-pointer transition-colors">+ Add Gear</button>
              )}
            </div>
          </div>
        )}

        {/* LOGISTICS NOTES */}
        {activeSection === "notes" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input aria-label="Input field"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
                placeholder="Add a note... (parking info, power drops, venue contact, etc.)"
                className="flex-1 border border-white/10 px-3 py-2 rounded-lg text-white placeholder:text-white/15 outline-none focus:border-[var(--color-accent)]"
              />
              <button aria-label="Action button" onClick={addNote} disabled={!newNote.trim()} className="px-3 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">Post</button>
            </div>
            {data.notes.length === 0 ? (
              <div className="text-center py-6 text-white/15">No notes yet — add logistics info for the crew</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.notes.map((note) => (
                  <div key={note.text} className="px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                    <p className="leading-relaxed">{note.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[var(--font-size-2xs)] font-bold text-[var(--color-accent)]/50">{note.author}</span>
                      <span className="text-[var(--font-size-2xs)] text-white/15">·</span>
                      <span className="text-[var(--font-size-2xs)] text-white/20">{note.time}</span>
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
