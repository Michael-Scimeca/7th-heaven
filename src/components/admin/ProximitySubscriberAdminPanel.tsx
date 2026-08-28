"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  MapPin,
  Search,
  Sliders,
  Trash2,
  Send,
  Edit2,
  Check,
  X,
  Smartphone,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";

export interface PushSubscriber {
  id: string;
  endpoint: string;
  zip?: string;
  radius?: string;
  selectedTypes?: string[];
  createdAt: string;
  updatedAt: string;
  deviceType?: string;
  fanName?: string;
}

export default function ProximitySubscriberAdminPanel() {
  const [subscribers, setSubscribers] = useState<PushSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [radiusFilter, setRadiusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editZip, setEditZip] = useState("");
  const [editRadius, setEditRadius] = useState("50");
  const [editName, setEditName] = useState("");
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState("🚨 7th Heaven Special Show Alert");
  const [testMessage, setTestMessage] = useState("Live show added within your area! Doors open at 8pm.");

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/push-subscribers");
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      }
    } catch (err) {
      console.error("Failed to load push subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleStartEdit = (sub: PushSubscriber) => {
    setEditingId(sub.id);
    setEditZip(sub.zip || "");
    setEditRadius(sub.radius || "50");
    setEditName(sub.fanName || "");
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch("/api/admin/push-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id,
          zip: editZip,
          radius: editRadius,
          fanName: editName,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setActionStatus(`Updated preferences for subscriber ${id.substring(0, 8)}`);
        setEditingId(null);
        fetchSubscribers();
        setTimeout(() => setActionStatus(null), 3500);
      }
    } catch (err) {
      console.error("Failed to update subscriber:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber preference?")) return;
    try {
      const res = await fetch("/api/admin/push-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setActionStatus("Subscriber removed successfully");
        fetchSubscribers();
        setTimeout(() => setActionStatus(null), 3500);
      }
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const handleSendTestPush = async (id: string) => {
    try {
      setActionStatus("Dispatching targeted push alert...");
      const res = await fetch("/api/admin/push-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_push",
          id,
          title: testTitle,
          message: testMessage,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setActionStatus("Targeted push notification sent!");
        setTimeout(() => setActionStatus(null), 3500);
      }
    } catch (err) {
      console.error("Failed to send targeted push:", err);
    }
  };

  const filtered = subscribers.filter((sub) => {
    const matchesSearch =
      !search ||
      (sub.fanName || "").toLowerCase().includes(search.toLowerCase()) ||
      (sub.zip || "").toLowerCase().includes(search.toLowerCase()) ||
      (sub.deviceType || "").toLowerCase().includes(search.toLowerCase());

    const matchesRadius = radiusFilter === "all" || sub.radius === radiusFilter;

    return matchesSearch && matchesRadius;
  });

  return (
    <div className="w-full rounded-lg relative my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">

          <div>
            <h2 className="font-[var(--font-heading)] text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
              Proximity Push Subscriber Controls
            </h2>
            <p className="text-purple-300 font-bold uppercase tracking-wider">
              Manage fan notification preferences, distance radii & targeted broadcasts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-lg bg-purple-900/60 border border-purple-500/30 text-purple-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-pink-400" /> {subscribers.length} Subscribers
          </span>
          <button
            type="button"
            onClick={fetchSubscribers}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer border border-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {actionStatus && (
        <div className="mb-6 p-4 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200 font-bold flex items-center gap-2 animate-pulse">
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
        <div className="sm:col-span-7 relative flex items-center w-full">
          <div className="input-glow-border rounded-lg w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers by name, zip code, or device..."
              className="w-full bg-black/40 border-none outline-none rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 transition-colors"
            />
          </div>
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20" />
        </div>

        <div className="sm:col-span-5 flex items-center gap-2">
          <label className="font-bold text-white uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-purple-400" /> Radius:
          </label>
          <div className="w-full">
            <GooeyMessagesDropdown
              selected={
                radiusFilter === "15"
                  ? "15 MILES ONLY"
                  : radiusFilter === "30"
                    ? "30 MILES ONLY"
                    : radiusFilter === "50"
                      ? "50 MILES ONLY"
                      : radiusFilter === "100"
                        ? "100 MILES ONLY"
                        : "ALL DISTANCES"
              }
              options={[
                { label: "ALL DISTANCES", value: "all" },
                { label: "15 MILES ONLY", value: "15" },
                { label: "30 MILES ONLY", value: "30" },
                { label: "50 MILES ONLY", value: "50" },
                { label: "100 MILES ONLY", value: "100" },
              ]}
              onChange={(val) => setRadiusFilter(val)}
              showAllOption={false}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#00000029] text-[11px] font-bold uppercase tracking-wider text-purple-300">
              <th className="py-3.5 px-4">Fan / Device</th>
              <th className="py-3.5 px-4">Zip Code</th>
              <th className="py-3.5 px-4">Radius</th>
              <th className="py-3.5 px-4">Types Allowed</th>
              <th className="py-3.5 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/90">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/40 font-bold uppercase tracking-widest">
                  Loading subscribers &hellip;
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/40 font-bold">
                  No matching subscribers found.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => {
                const isEditing = editingId === sub.id;

                return (
                  <tr key={sub.id} className="hover: bg-[#00000029] transition-colors">
                    {/* Fan / Device */}
                    <td className="py-4 px-4 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-black/60 border border-purple-500/50 rounded-lg px-2.5 py-1 text-white"
                        />
                      ) : (
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{sub.fanName || "Anonymous Fan"}</span>
                          </div>
                          <div className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                            <Smartphone className="w-3 h-3 text-purple-400" />
                            <span>{sub.deviceType || "Browser"}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Zip Code */}
                    <td className="py-4 px-4 font-bold text-purple-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editZip}
                          onChange={(e) => setEditZip(e.target.value)}
                          className="bg-black/60 border border-purple-500/50 rounded-lg px-2.5 py-1 text-white w-24"
                        />
                      ) : (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-pink-400" /> {sub.zip || "60056"}
                        </span>
                      )}
                    </td>

                    {/* Distance Radius */}
                    <td className="py-4 px-4 font-bold">
                      {isEditing ? (
                        <GooeyMessagesDropdown
                          options={[
                            { label: "15 Mi", value: "15" },
                            { label: "30 Mi", value: "30" },
                            { label: "50 Mi", value: "50" },
                            { label: "100 Mi", value: "100" },
                            { label: "All", value: "all" },
                          ]}
                          selected={editRadius}
                          onChange={(val: string) => setEditRadius(val)}
                          placeholder="Select Radius"
                          showAllOption={false}
                        />
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold uppercase">
                          {sub.radius === "all" ? "All Distance" : `${sub.radius} Mi`}
                        </span>
                      )}
                    </td>

                    {/* Types Allowed */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(sub.selectedTypes || ["all"]).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-bold uppercase"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Admin Actions */}
                    <td className="py-4 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(sub.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                            title="Save Preference"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 font-bold transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendTestPush(sub.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-bold transition-colors cursor-pointer"
                            title="Send Targeted Test Push"
                          >
                            <Send className="w-3.5 h-3.5" /> Test Push
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(sub)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                            title="Edit Fan Preference"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
