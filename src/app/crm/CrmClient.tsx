"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import PageSection from "@/components/PageSection";
import SectionHeader from "@/components/SectionHeader";
import Stack from "@/components/Stack";
import { Button } from "@/components/Button";
import { AdminCrmPipeline } from "@/app/admin/[username]/components/AdminCrmPipeline";

export default function CrmClient() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/booking");
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      }
    } catch (err) {
      console.warn("Failed to fetch CRM bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleUpdateLoadInTime = async (bookingId: string, email: string, time: string) => {
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          loadInTime: time,
          notifyPlannerLoadIn: true,
        }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === bookingId ? { ...b, loadInTime: time, load_in_time: time } : b
          )
        );
      }
    } catch (err) {
      console.error("Failed to update load-in time:", err);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#210e2a] text-white selection:bg-action selection:text-black">
      {/* ── Open Hero Canvas ── */}
      <header className="relative pt-20 pb-12 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(168,85,247,0.22),transparent)]" />
        
        <div className="site-container relative z-10 flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
              <span className="px-2.5 py-0.5 rounded-full bg-action/15 border border-action/30 text-action text-xs font-bold uppercase tracking-wider">
                Live CRM
              </span>
            </div>

            <Button
              variant="tertiary"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : "Refresh Leads"}
            </Button>
          </div>

          <h1 className="font-heading text-display leading-tight text-white tracking-normal uppercase mt-2">
            Event Booking CRM & Pipeline
          </h1>

          <p className="max-w-2xl text-body text-zinc-300 leading-relaxed text-pretty">
            Full client lifecycle tracking: incoming inquiries, proposals, contracts, confirmed bookings, internal CRM activity notes, and venue load-in logistics.
          </p>
        </div>
      </header>

      {/* ── Main CRM Section ── */}
      <PageSection id="crm-pipeline" aria-labelledby="crm-pipeline-heading" size="md">
        <SectionHeader
          id="crm-pipeline-heading"
          title="Lead Pipeline & Planners Directory"
          subtitle="Manage talent buyer relationships, update proposal and contract states, log contact notes, and set production schedules."
          badge="CRM Hub"
        />

        <Stack gap="lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-center rounded-[var(--radius-box)] border border-white/10 bg-black/40">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-action mb-4" />
              <p className="text-zinc-300 font-semibold">Loading live leads and bookings...</p>
            </div>
          ) : (
            <AdminCrmPipeline
              bookings={bookings}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onUpdateLoadInTime={handleUpdateLoadInTime}
              updatingBookingId={updatingBookingId}
            />
          )}
        </Stack>
      </PageSection>
    </main>
  );
}
