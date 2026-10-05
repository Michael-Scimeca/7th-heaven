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
  RefreshCw,
} from "lucide-react";
import SeventhButton from "@/components/SeventhButton";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import { GlowInput } from "@/components/GlowInput";

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
  const [testTitle, setTestTitle] = useState(
    "🚨 7th Heaven Special Show Alert",
  );
  const [testMessage, setTestMessage] = useState(
    "Live show added within your area! Doors open at 8pm.",
  );

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
        setActionStatus(
          `Updated preferences for subscriber ${id.substring(0, 8)}`,
        );
        setEditingId(null);
        fetchSubscribers();
        setTimeout(() => setActionStatus(null), 3500);
      }
    } catch (err) {
      console.error("Failed to update subscriber:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber preference?"))
      return;
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
    <div className="relative my-8 w-full">
      {/* Action Controls Bar */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <span className="flex items-center gap-1.5 border border-purple-500/30 bg-purple-900/60 px-3.5 py-1.5 text-purple-200">
          <Users className="h-4 w-4 text-pink-400" /> {subscribers.length}{" "}
          Subscribers
        </span>
        <button
          type="button"
          onClick={fetchSubscribers}
          className="transition-colors flex cursor-pointer items-center gap-1.5 border border-white/10 bg-white/10 px-3.5 py-1.5 hover:bg-white/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {actionStatus && (
        <div className="mb-6 flex animate-pulse items-center gap-2 border border-purple-500/40 bg-purple-950/80 p-4 text-purple-200">
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="relative flex w-full items-center sm:col-span-7">
            <GlowInput
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers by name, zip code, or device..."
              className="!pl-10"
            />
          <Search className="pointer-events-none absolute top-1/2 left-3.5 z-20 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>

        <div className="flex items-center gap-2 sm:col-span-5">
          <label className="flex shrink-0 items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-purple-400" /> Radius:
          </label>
          <div className="w-full">
            <GooeyMessagesDropdown
              selected={radiusFilter}
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

      {/* Subscribers Grid */}
      <div className="custom-scrollbar overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Grid Header */}
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-[#00000029] px-4 py-3.5 text-xs font-semibold text-white/60">
            <div className="col-span-3">Fan / Device</div>
            <div className="col-span-2">Zip Code</div>
            <div className="col-span-2">Radius</div>
            <div className="col-span-2">Types Allowed</div>
            <div className="col-span-3 text-right">Admin Actions</div>
          </div>

          {/* Grid Body */}
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="py-8 text-center text-xs text-white/40">
                Loading subscribers &hellip;
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No matching subscribers found.
              </div>
            ) : (
              filtered.map((sub) => {
                const isEditing = editingId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="grid grid-cols-12 gap-3 items-center bg-[#00000029] px-4 py-4 text-xs"
                  >
                    {/* Fan / Device */}
                    <div className="col-span-3 min-w-0">
                      {isEditing ? (
                        <GlowInput
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="truncate">{sub.fanName || "Anonymous Fan"}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/50">
                            <Smartphone className="h-3 w-3 text-purple-400 shrink-0" />
                            <span>{sub.deviceType || "Browser"}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zip Code */}
                    <div className="col-span-2 text-purple-200">
                      {isEditing ? (
                        <GlowInput
                          type="text"
                          value={editZip}
                          onChange={(e) => setEditZip(e.target.value)}
                          wrapperClassName="w-24"
                        />
                      ) : (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0" />{" "}
                          {sub.zip || "60056"}
                        </span>
                      )}
                    </div>

                    {/* Distance Radius */}
                    <div className="col-span-2">
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
                        <span className="inline-block rounded border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs">
                          {sub.radius === "all"
                            ? "All Distance"
                            : `${sub.radius} Mi`}
                        </span>
                      )}
                    </div>

                    {/* Types Allowed */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {(sub.selectedTypes || ["all"]).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-white/10 px-2 py-0.5 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="col-span-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(sub.id)}
                            className="transition-colors cursor-pointer rounded bg-emerald-600 p-1.5 hover:bg-emerald-500"
                            title="Save Preference"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="transition-colors cursor-pointer rounded bg-white/10 p-1.5 hover:bg-white/20"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendTestPush(sub.id)}
                            className="transition-colors inline-flex cursor-pointer items-center gap-1 rounded bg-purple-600/80 px-2.5 py-1.5 text-xs hover:bg-purple-600"
                            title="Send Targeted Test Push"
                          >
                            <Send className="h-3.5 w-3.5" /> Test Push
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(sub)}
                            className="transition-colors cursor-pointer rounded bg-white/10 p-1.5 hover:bg-white/20 hover:text-white"
                            title="Edit Fan Preference"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            className="transition-colors cursor-pointer rounded bg-rose-500/20 p-1.5 text-rose-300 hover:bg-rose-500/40"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
