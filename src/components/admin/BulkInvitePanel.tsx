"use client";

import { useState, useRef } from "react";

interface ParsedInvite {
  email: string;
  name?: string;
  status: "pending" | "sending" | "success" | "failed";
  error?: string;
  pin?: string;
}

export default function BulkInvitePanel() {
  const [inputText, setInputText] = useState("");
  const [invites, setInvites] = useState<ParsedInvite[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple client-side parser for CSV/Text input
  const parseInvites = (text: string) => {
    const lines = text.split(/\r?\n/);
    const parsed: ParsedInvite[] = [];
    const seenEmails = new Set<string>();

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Skip common CSV header row
      if (
        cleanLine.toLowerCase().startsWith("email") ||
        cleanLine.toLowerCase().startsWith("name,email") ||
        cleanLine.toLowerCase().startsWith("email,name")
      ) {
        return;
      }

      // Split by common delimiters (comma, semicolon, tab)
      const parts = cleanLine.split(/[,;\t]/);
      let email = "";
      let name = "";

      if (parts.length === 1) {
        // Just an email address on the line
        email = parts[0].trim();
      } else {
        // Try to identify which part is the email
        const emailIdx = parts.findIndex((p) => p.includes("@"));
        if (emailIdx !== -1) {
          email = parts[emailIdx].trim();
          // The other part is assumed to be the name
          name = parts.filter((_, idx) => idx !== emailIdx).join(" ").trim();
        } else {
          // Fallback: first column email, second name
          email = parts[0].trim();
          name = parts[1].trim();
        }
      }

      // Basic regex check and duplicate check
      const cleanEmail = email.toLowerCase().replace(/[<>'"\s]/g, "");
      if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && !seenEmails.has(cleanEmail)) {
        seenEmails.add(cleanEmail);
        parsed.push({
          email: cleanEmail,
          name: name || undefined,
          status: "pending",
        });
      }
    });

    if (parsed.length > 0) {
      setInvites(parsed);
      setResults(null);
    } else {
      alert("No valid email addresses found in the input.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseInvites(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseInvites(text);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .csv file.");
    }
  };

  const dispatchInvites = async () => {
    if (invites.length === 0) return;
    setSending(true);
    setResults(null);

    // Reset status to sending/pending
    setInvites((prev) => prev.map((inv) => ({ ...inv, status: "pending", error: undefined })));

    let successCount = 0;
    let failedCount = 0;

    // Send in batches of 10 for safety and rate limiting
    const batchSize = 10;
    const payloadInvites = invites.map((inv) => ({ email: inv.email, name: inv.name }));

    for (let i = 0; i < payloadInvites.length; i += batchSize) {
      const batch = payloadInvites.slice(i, i + batchSize);
      
      // Update local states to "sending" for the current batch
      setInvites((prev) =>
        prev.map((inv, idx) =>
          idx >= i && idx < i + batch.length ? { ...inv, status: "sending" } : inv
        )
      );

      try {
        const res = await fetch("/api/admin/invite-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invites: batch }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          successCount += data.successCount;
          failedCount += data.failedCount;

          // Build a lookup map of failures
          const failureMap = new Map<string, string>();
          data.failures?.forEach((f: any) => failureMap.set(f.email, f.error));

          setInvites((prev) =>
            prev.map((inv, idx) => {
              if (idx >= i && idx < i + batch.length) {
                const failReason = failureMap.get(inv.email);
                if (failReason) {
                  return { ...inv, status: "failed", error: failReason };
                }
                return { ...inv, status: "success" };
              }
              return inv;
            })
          );
        } else {
          failedCount += batch.length;
          setInvites((prev) =>
            prev.map((inv, idx) =>
              idx >= i && idx < i + batch.length
                ? { ...inv, status: "failed", error: data.error || "Batch failed" }
                : inv
            )
          );
        }
      } catch (err: any) {
        failedCount += batch.length;
        setInvites((prev) =>
          prev.map((inv, idx) =>
            idx >= i && idx < i + batch.length
              ? { ...inv, status: "failed", error: err.message || "Network error" }
              : inv
          )
        );
      }
    }

    setSending(false);
    setResults({ success: successCount, failed: failedCount });
  };

  const clearList = () => {
    setInvites([]);
    setResults(null);
    setInputText("");
  };

  return (
    <>
        {/* Input Form Stage */}
        {invites.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CSV File Upload Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed  p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] scale-[0.99]"
                  : "border-black/20 bg-black/[0.02] hover:border-black/40 hover:bg-black/[0.04]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <span className="text-3xl mb-3 block"></span>
              <p className="text-black text-xs font-black uppercase tracking-wider">Drag & Drop CSV File</p>
              <p className="text-black/60 text-2xs mt-1.5 leading-relaxed max-w-xs font-semibold">
                Supports standard comma/tab-separated files. We automatically search for Name and Email fields.
              </p>
              <span className="mt-4 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white text-[0.65rem] font-bold uppercase tracking-widest rounded-lg border border-[var(--color-accent)] shadow-xs">
                Browse Files
              </span>
            </div>

            {/* Direct Copy-Paste Text Area */}
            <div className="flex flex-col gap-3">
              <label className="text-xs uppercase tracking-[0.15em] text-black/70 font-black">Copy-Paste Contact List</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="email1@example.com&#10;Name Two, email2@example.com&#10;email3@example.com; Name Three"
                rows={5}
                className="w-full bg-white border border-black/15 text-black text-xs px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] font-mono resize-none placeholder:text-black/30 font-semibold"
              />
              <button
                onClick={() => parseInvites(inputText)}
                disabled={!inputText.trim()}
                className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white font-black text-xs uppercase tracking-widest transition-all border border-[var(--color-accent)] cursor-pointer disabled:opacity-30 shadow-sm"
              >
                 Parse & Import list
              </button>
            </div>
          </div>
        ) : (
          /* Verification Preview / Progress Stage */
          <div className="space-y-6">
            {/* Status overview */}
            <div className="p-4 border border-black/10 bg-black/[0.02] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl"></span>
                <div>
                  <p className="text-black text-xs font-black uppercase tracking-widest">Parsed Invite Roster</p>
                  <p className="text-black/60 text-2xs mt-0.5 font-semibold">Found {invites.length} prospective fans to invite.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearList}
                  disabled={sending}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-black/70 hover:text-black bg-black/5 hover:bg-black/10 rounded-lg border border-black/15 cursor-pointer disabled:opacity-30"
                >
                  Clear List
                </button>
                <button
                  type="button"
                  onClick={dispatchInvites}
                  disabled={sending}
                  className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md transition-all border border-[var(--color-accent)] disabled:opacity-40 cursor-pointer"
                >
                  {sending ? " Sending Invites..." : " Send Invitation Email Blasts"}
                </button>
              </div>
            </div>

            {/* Results Toast */}
            {results && (
              <div className={`p-4  border flex items-center gap-3 ${
                results.failed > 0 
                  ? "bg-rose-50 border-rose-200 text-rose-800" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className="text-lg">{results.failed > 0 ? "" : ""}</span>
                <p className="text-xs font-black uppercase tracking-widest">
                  Dispatched: {results.success} invites sent successfully{results.failed > 0 && `, ${results.failed} failed`}.
                </p>
              </div>
            )}

            {/* Invite table */}
            <div className="max-h-[300px] overflow-y-auto border border-black/10 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/5 text-black/70 uppercase tracking-widest text-[0.65rem] border-b border-black/10">
                    <th className="py-3 px-4 font-black">Email</th>
                    <th className="py-3 px-4 font-black">Name</th>
                    <th className="py-3 px-4 font-black text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {invites.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-black/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-black">{inv.email}</td>
                      <td className="py-3.5 px-4 text-black/70 font-semibold">{inv.name || <span className="italic text-black/30">N/A</span>}</td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === "pending" && (
                          <span className="px-2.5 py-1 bg-black/5 text-black/60 rounded-full font-bold uppercase tracking-wider text-[0.55rem]">
                            Pending
                          </span>
                        )}
                        {inv.status === "sending" && (
                          <span className="px-2.5 py-1 bg-[var(--color-accent)] text-[var(--color-accent)] rounded-full font-bold uppercase tracking-wider text-[0.55rem] animate-pulse">
                            Sending…
                          </span>
                        )}
                        {inv.status === "success" && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wider text-[0.55rem] border border-emerald-300">
                             Sent
                          </span>
                        )}
                        {inv.status === "failed" && (
                          <span
                            title={inv.error}
                            className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold uppercase tracking-wider text-[0.55rem] border border-rose-300 cursor-help"
                          >
                             Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </>
  );
}
