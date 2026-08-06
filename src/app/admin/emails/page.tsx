"use client";

import { useState } from "react";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";
import CustomScrollbar from "@/components/CustomScrollbar";

const categories = ["All", ...Array.from(new Set(EMAIL_TEMPLATES.map(t => t.category)))];

export default function EmailPreviewPage() {
  const [activeId, setActiveId] = useState(EMAIL_TEMPLATES[0].id);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const filtered = activeCategory === "All" ? EMAIL_TEMPLATES : EMAIL_TEMPLATES.filter(t => t.category === activeCategory);
  const active = EMAIL_TEMPLATES.find(t => t.id === activeId) || EMAIL_TEMPLATES[0];
  const html = active.render();

  const handleSendTest = async () => {
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
          setSendResult({ success: true, message: `Successfully sent test to ${testEmail}` });
        } else {
          setSendResult({ success: false, message: data.error || "Failed to send email" });
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setSendResult({ success: false, message: data.error || `HTTP error ${res.status}` });
      }
      setTimeout(() => setSendResult(null), 5000);
    } catch (err: any) {
      setSendResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen bg-[var(--color-bg-deep)] pt-[72px] overflow-hidden">
      <div className="flex h-full overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-[320px] border-r border-white/5 bg-[#08080c] flex flex-col shrink-0 min-h-0 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h1 className="text-lg font-black tracking-tight text-white mb-1">Email Templates</h1>
            <p className="text-sm text-white/30">{EMAIL_TEMPLATES.length} templates • {EMAIL_TEMPLATES.filter(t => t.status === 'live').length} live</p>
          </div>

          {/* Category tabs */}
          <div className="px-4 pt-4 flex gap-1.5 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer ${activeCategory === c ? 'bg-[var(--color-accent)] text-white' : 'bg-white/[0.03] text-white/30 hover:text-white/60'
                  }`}
              >{c}</button>
            ))}
          </div>

          {/* Template list */}
          <CustomScrollbar className="p-4 space-y-1.5">
            {filtered.map(t => (
              <button key={t.id} onClick={() => setActiveId(t.id)}
                className={`w-full text-left p-4  transition-colors cursor-pointer group ${activeId === t.id
                  ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30'
                  : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-bold ${activeId === t.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                    {t.name}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${t.status === 'live'
                    ? 'bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30'
                    : 'bg-purple-600/10 text-purple-300 border border-purple-500/20'
                    }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-white/30 leading-relaxed">{t.description}</p>
                <span className="text-xs  text-[var(--color-accent)]/60 font-bold uppercase tracking-widest mt-2 block">{t.category}</span>
              </button>
            ))}
          </CustomScrollbar>
        </div>

        {/* ── Preview Panel ── */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-14 border-b border-white/5 bg-[#08080c] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-white">{active.name}</h2>
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${active.status === 'live'
                ? 'bg-emerald-500/10 text-[var(--color-accent)]'
                : 'bg-purple-600/10 text-purple-300'
                }`}>{active.status}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Test Email Form */}
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg pl-3 pr-1 py-1 group focus-within:border-[var(--color-accent)]/50 transition-colors">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder:text-white/20 outline-none w-[180px]"
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending}
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  {sending ? "Sending..." : "Send Test"}
                </button>
              </div>

              <div className="h-4 w-px bg-white/5" />

              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${viewMode === 'preview' ? 'bg-[var(--color-accent)] text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                >Preview</button>
                <button onClick={() => setViewMode("code")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${viewMode === 'code' ? 'bg-[var(--color-accent)] text-white' : 'text-white/30 hover:text-white/60'
                    }`}
                >HTML</button>
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {sendResult && (
            <div className={`px-6 py-2 text-xs font-bold uppercase tracking-widest text-center animate-[fade-in_0.3s_ease-out] ${sendResult.success ? 'bg-emerald-500/10 text-[var(--color-accent)] border-b  border-[var(--color-accent)]/30' : 'bg-red-500/10 text-red-400 border-b border-red-500/20'
              }`}>
              {sendResult.message}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-[var(--color-bg-card)] flex justify-center p-8">
            {viewMode === "preview" ? (
              <div className="w-full max-w-[620px]">
                <div className="bg-[var(--color-bg-deep)] overflow-hidden border border-white/5">
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
              <pre className="w-full max-w-[900px] bg-[var(--color-bg-surface)] border border-white/5 p-6 text-sm text-white/50 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {html}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
