"use client";
import { useState } from "react";

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
    { id: "crew" as const, label: "Crew", count: `${confirmedCount}/${data.crew.length}`, icon: "👥" },
    { id: "timeline" as const, label: "Schedule", count: data.timeline.filter(t => t.time).length + "/" + data.timeline.length, icon: "🕐" },
    { id: "gear" as const, label: "Gear", count: `${gearPct}%`, icon: "🎸" },
    { id: "notes" as const, label: "Notes", count: String(data.notes.length), icon: "📝" },
  ];

  return (
    <div className="bg-[#08080e] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm">🎪</span>
          <div>
            <span className="text-[0.7rem] font-bold text-white/80">Show Crew — {bookingId}</span>
            <span className="text-[0.55rem] text-white/30 ml-2">{eventDate} · {venueName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[0.5rem] font-bold text-white/20 uppercase tracking-widest">Headcount:</span>
          <span className={`text-[0.65rem] font-black ${confirmedCount > 0 ? 'text-emerald-400' : 'text-white/30'}`}>{confirmedCount}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 px-4 py-2.5 text-[0.6rem] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5
              ${activeSection === tab.id
                ? 'text-purple-400 bg-purple-500/5 border-b-2 border-purple-500'
                : 'text-white/25 hover:text-white/50 hover:bg-white/[0.02]'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[0.45rem] font-bold ${activeSection === tab.id ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/30'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">

        {/* CREW ROSTER */}
        {activeSection === "crew" && (
          <div>
            {data.crew.length === 0 && !addingCrew ? (
              <div className="text-center py-8">
                <p className="text-white/20 text-[0.75rem] mb-3">No crew assigned yet</p>
                <button onClick={() => setAddingCrew(true)} className="text-[0.6rem] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">+ Add First Crew Member</button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 mb-3">
                  {data.crew.map((c, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${c.confirmed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.01] border-white/5'}`}>
                      <button onClick={() => toggleConfirm(i)} className="cursor-pointer shrink-0" title={c.confirmed ? 'Confirmed' : 'Click to confirm'}>
                        {c.confirmed ? <span className="text-emerald-400 text-sm">✅</span> : <span className="text-white/15 text-sm">⬜</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[0.75rem] font-bold ${c.confirmed ? 'text-white/70' : 'text-white/40'}`}>{c.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-wider shrink-0 ${c.confirmed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400/60 border border-purple-500/15'}`}>{c.role}</span>
                      <button onClick={() => removeCrew(i)} className="text-white/10 hover:text-rose-400 text-[0.6rem] cursor-pointer transition-colors shrink-0">✕</button>
                    </div>
                  ))}
                </div>

                {addingCrew ? (
                  <div className="flex gap-2 items-end bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <div className="flex-1">
                      <label className="text-[0.5rem] uppercase tracking-widest text-white/30 font-bold block mb-1">Name</label>
                      <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCrew()} autoFocus placeholder="Crew member name" className="w-full bg-[#050508] border border-white/10 px-3 py-2 rounded-lg text-[0.75rem] text-white placeholder:text-white/15 outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-[0.5rem] uppercase tracking-widest text-white/30 font-bold block mb-1">Role</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value)} className="bg-[#050508] border border-white/10 px-3 py-2 rounded-lg text-[0.75rem] text-white outline-none focus:border-purple-500 [color-scheme:dark]">
                        {CREW_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <button onClick={addCrew} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shrink-0">Add</button>
                    <button onClick={() => setAddingCrew(false)} className="text-[0.6rem] text-white/30 hover:text-white/50 cursor-pointer shrink-0 py-2">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingCrew(true)} className="text-[0.55rem] font-bold uppercase tracking-widest text-purple-400/60 hover:text-purple-400 cursor-pointer transition-colors">+ Add Crew</button>
                )}
              </>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {activeSection === "timeline" && (
          <div className="space-y-2">
            {data.timeline.map((event, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] border border-white/5">
                <div className="relative flex flex-col items-center shrink-0">
                  <div className={`w-3 h-3 rounded-full border-2 ${event.time ? 'bg-purple-500 border-purple-400' : 'bg-transparent border-white/15'}`} />
                  {i < data.timeline.length - 1 && <div className="w-px h-6 bg-white/5 absolute top-3.5" />}
                </div>
                <span className="text-[0.7rem] font-bold text-white/50 w-24 shrink-0">{event.label}</span>
                <input
                  type="text"
                  value={event.time}
                  onChange={e => updateTimeline(i, e.target.value)}
                  placeholder="e.g. 3:00 PM"
                  className="flex-1 bg-transparent border-b border-white/5 focus:border-purple-500/50 text-[0.75rem] text-white px-1 py-1 outline-none placeholder:text-white/10 transition-colors"
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
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${gearPct === 100 ? 'bg-emerald-500' : gearPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${gearPct}%` }} />
              </div>
              <span className={`text-[0.6rem] font-bold ${gearPct === 100 ? 'text-emerald-400' : 'text-white/30'}`}>{gearLoaded}/{data.gear.length} loaded</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {data.gear.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${item.loaded ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/[0.01] border-white/5'}`}>
                  <button onClick={() => toggleGear(i)} className="cursor-pointer shrink-0">
                    {item.loaded ? <span className="text-emerald-400 text-xs">✅</span> : <span className="text-white/15 text-xs">⬜</span>}
                  </button>
                  <span className={`text-[0.65rem] flex-1 truncate ${item.loaded ? 'text-white/50 line-through' : 'text-white/60'}`}>{item.name}</span>
                  <button onClick={() => removeGear(i)} className="text-white/10 hover:text-rose-400 text-[0.5rem] cursor-pointer transition-colors shrink-0">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              {addingGear ? (
                <div className="flex gap-2">
                  <input value={newGearName} onChange={e => setNewGearName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGearItem()} autoFocus placeholder="Gear item name" className="flex-1 bg-[#050508] border border-white/10 px-3 py-1.5 rounded-lg text-[0.7rem] text-white placeholder:text-white/15 outline-none focus:border-purple-500" />
                  <button onClick={addGearItem} className="text-[0.55rem] text-emerald-400 font-bold uppercase tracking-wider cursor-pointer px-2">Add</button>
                  <button onClick={() => setAddingGear(false)} className="text-[0.55rem] text-white/30 cursor-pointer px-1">✕</button>
                </div>
              ) : (
                <button onClick={() => setAddingGear(true)} className="text-[0.55rem] font-bold uppercase tracking-widest text-purple-400/60 hover:text-purple-400 cursor-pointer transition-colors">+ Add Gear</button>
              )}
            </div>
          </div>
        )}

        {/* LOGISTICS NOTES */}
        {activeSection === "notes" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
                placeholder="Add a note... (parking info, power drops, venue contact, etc.)"
                className="flex-1 bg-[#050508] border border-white/10 px-3 py-2 rounded-lg text-[0.75rem] text-white placeholder:text-white/15 outline-none focus:border-purple-500"
              />
              <button onClick={addNote} disabled={!newNote.trim()} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">Post</button>
            </div>
            {data.notes.length === 0 ? (
              <div className="text-center py-6 text-white/15 text-[0.7rem]">No notes yet — add logistics info for the crew</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.notes.map((note, i) => (
                  <div key={i} className="px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                    <p className="text-[0.75rem] text-white/70 leading-relaxed">{note.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[0.5rem] font-bold text-purple-400/50">{note.author}</span>
                      <span className="text-[0.5rem] text-white/15">·</span>
                      <span className="text-[0.5rem] text-white/20">{note.time}</span>
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
