"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState } from "react";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";
import CustomScrollbar from "@/components/CustomScrollbar";

const categories = [
  "All",
  ...Array.from(new Set(EMAIL_TEMPLATES.map((t) => t.category))),
];

export default function EmailPreviewPage() {
  const [activeId, setActiveId] = useState(EMAIL_TEMPLATES[0].id);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const filtered =
    activeCategory === "All"
      ? EMAIL_TEMPLATES
      : EMAIL_TEMPLATES.filter((t) => t.category === activeCategory);
  const active =
    EMAIL_TEMPLATES.find((t) => t.id === activeId) || EMAIL_TEMPLATES[0];
  const html = active.render();

  const handleSendTest = async () => {
    if (sending) return;
    if (!testEmail) {
      alert("Please enter a recipient email address.");
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: `TEST: ${active.name}`,
          html: html,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSendResult({
            success: true,
            message: `Successfully sent test to ${testEmail}`,
          });
        } else {
          setSendResult({
            success: false,
            message: data.error || "Failed to send email",
          });
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setSendResult({
          success: false,
          message: data.error || `HTTP error ${res.status}`,
        });
      }
      setTimeout(() => setSendResult(null), 5000);
    } catch (err: any) {
      setSendResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden pt-[72px]">
      <div className="flex h-full overflow-hidden">
        {/* ── Sidebar ── */}
        <div className="flex min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#08080c]">
          <div className="border-b border-white/5 p-6">
            <h1 className="mb-1">Email Templates</h1>
            <p>
              {EMAIL_TEMPLATES.length} templates •{" "}
              {EMAIL_TEMPLATES.filter((t) => t.status === "live").length} live
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 px-4 pt-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`cursor-pointer rounded-lg px-3 py-1 ${activeCategory === c ? "bg-[var(--color-accent)]" : "bg-white/[0.03] text-white/30"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Template list */}
          <CustomScrollbar className="space-y-1.5 p-4">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`group w-full cursor-pointer p-4 text-left ${activeId === t.id ? "border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10" : "border border-transparent"}`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`${activeId === t.id ? " " : "group-hover:text-white"}`}
                  >
                    {t.name}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 ${t.status === "live" ? "border border-[var(--color-accent)]/30 bg-emerald-500/10" : "border border-white/20 bg-purple-600/10"}`}
                  >
                    {t.status}
                  </span>
                </div>
                <p>{t.description}</p>
                <span className="mt-2 block text-[var(--color-accent)]/60">
                  {t.category}
                </span>
              </button>
            ))}
          </CustomScrollbar>
        </div>

        {/* ── Preview Panel ── */}
        <div className="flex flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#08080c] px-6">
            <div className="flex items-center gap-3">
              <h2>{active.name}</h2>
              <span
                className={`rounded-lg px-2 py-0.5 ${active.status === "live" ? "bg-emerald-500/10 text-[var(--color-accent)]" : "bg-purple-600/10"}`}
              >
                {active.status}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Test Email Form */}
              <div className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1 pr-1 pl-3 focus-within:border-[var(--color-accent)]/50">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="placeholder: w-[180px] text-white/20 outline-none"
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending}
                  className="cursor-pointer rounded-lg bg-[var(--color-accent)] px-3 py-1.5 hover:bg-[var(--color-accent)]/80 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Test"}
                </button>
              </div>

              <div className="h-4 w-px bg-[#00000029]" />

              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous"
                  onClick={() => setViewMode("preview")}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 ${viewMode === "preview" ? "bg-[var(--color-accent)]" : "text-white/30"}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 ${viewMode === "code" ? "bg-[var(--color-accent)]" : "text-white/30"}`}
                >
                  HTML
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {sendResult && (
            <div
              className={`animate-[fade-in_0.3s_ease-out] px-6 py-2 text-center ${sendResult.success ? "border-b border-[var(--color-accent)]/30 bg-emerald-500/10" : "border-b border-red-500/20 bg-red-500/10 text-red-400"}`}
            >
              {sendResult.message}
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 justify-center overflow-y-auto bg-[var(--color-bg-card)] p-8">
            {viewMode === "preview" ? (
              <div className="w-full max-w-[620px]">
                <div className="overflow-hidden border border-white/5">
                  <iframe
                    srcDoc={html}
                    className="w-full border-0"
                    style={{ height: 900 }}
                    sandbox="allow-same-origin"
                    title={`Preview: ${active.name}`}
                  />
                </div>
              </div>
            ) : (
              <pre className="w-full max-w-[900px] overflow-x-auto border border-white/10 bg-[var(--color-bg-surface)] p-6 whitespace-pre-wrap text-white/50">
                {html}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
