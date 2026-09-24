/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useRef } from "react";
import SeventhButton from "@/components/SeventhButton";

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
  const [results, setResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);
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
          name = parts
            .filter((_, idx) => idx !== emailIdx)
            .join(" ")
            .trim();
        } else {
          // Fallback: first column email, second name
          email = parts[0].trim();
          name = parts[1].trim();
        }
      }

      // Basic regex check and duplicate check
      const cleanEmail = email.toLowerCase().replace(/[<>'"\s]/g, "");
      if (
        cleanEmail &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) &&
        !seenEmails.has(cleanEmail)
      ) {
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

    try {
      // Reset status to sending/pending
      setInvites((prev) =>
        prev.map((inv) => ({ ...inv, status: "pending", error: undefined })),
      );

      let successCount = 0;
      let failedCount = 0;

      // Send in batches of 10 for safety and rate limiting
      const batchSize = 10;
      const payloadInvites = invites.map((inv) => ({
        email: inv.email,
        name: inv.name || "",
      }));

      // Split invites into batches and process in parallel
      const batches: {
        start: number;
        batch: { email: string; name: string }[];
      }[] = [];
      for (let i = 0; i < payloadInvites.length; i += batchSize) {
        batches.push({
          start: i,
          batch: payloadInvites.slice(i, i + batchSize),
        });
      }

      setInvites((prev) => prev.map((inv) => ({ ...inv, status: "sending" })));

      const batchResults = await Promise.all(
        batches.map(async ({ start, batch }) => {
          try {
            const res = await fetch("/api/admin/invite-csv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ invites: batch }),
            });
            if (res.ok) {
              const data = await res.json();
              return { start, batch, data };
            }
            return { start, batch, error: "Batch request failed" };
          } catch (err: any) {
            return { start, batch, error: err.message || "Network error" };
          }
        }),
      );

      for (const { start, batch, data, error } of batchResults) {
        if (data && data.success) {
          successCount += data.successCount || 0;
          failedCount += data.failedCount || 0;
          const failureMap = new Map<string, string>();
          data.failures?.forEach((f: any) => failureMap.set(f.email, f.error));

          setInvites((prev) =>
            prev.map((inv, idx) => {
              if (idx >= start && idx < start + batch.length) {
                const failReason = failureMap.get(inv.email);
                if (failReason) {
                  return { ...inv, status: "failed", error: failReason };
                }
                return { ...inv, status: "success" };
              }
              return inv;
            }),
          );
        } else {
          failedCount += batch.length;
          setInvites((prev) =>
            prev.map((inv, idx) =>
              idx >= start && idx < start + batch.length
                ? { ...inv, status: "failed", error: error || "Batch failed" }
                : inv,
            ),
          );
        }
      }

      setResults({ success: successCount, failed: failedCount });
    } finally {
      setSending(false);
    }
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CSV File Upload Dropzone */}
          <button
            type="button"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full cursor-pointer flex-col items-center justify-center !border-2 !border-dashed border-white/10 p-8 text-center transition-colors duration-300 ${isDragging ? "scale-[0.99]" : "] border-black/20"}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <span className="mb-3 block text-3xl"></span>
            <p className="r">Drag & Drop CSV File</p>
            <p className=".5 max-w-xs text-black/60">
              Supports standard comma/tab-separated files. We automatically
              search for Name and Email fields.
            </p>
            <SeventhButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-4 !px-5 !py-2"
            >
              Browse Files
            </SeventhButton>
          </button>

          {/* Direct Copy-Paste Text Area */}
          <div className="flex flex-col gap-3">
            <label htmlFor="bulk-invite-text-input" className="text-white/70">
              Copy-Paste Contact List
            </label>
            <div className="input-glow-border w-full">
              <textarea
                aria-label="Text input"
                id="bulk-invite-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="email1@example.com&#10;Name Two, email2@example.com&#10;email3@example.com; Name Three"
                rows={5}
                className="placeholder: w-full resize-none rounded-lg border-white/10 bg-black/40 px-4 py-3 text-white/40 transition-colors outline-none"
              />
            </div>
            <SeventhButton
              type="button"
              onClick={() => parseInvites(inputText)}
              disabled={!inputText.trim()}
              className="w-full justify-center !px-5 !py-3 disabled:opacity-30"
            >
              Parse & Import List
            </SeventhButton>
          </div>
        </div>
      ) : (
        /* Verification Preview / Progress Stage */
        <div className="space-y-6">
          {/* Status overview */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-black/10 bg-black/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <p className="text-black">Parsed Invite Roster</p>
                <p className="mt-0.5 text-black/60">
                  Found {invites.length} prospective fans to invite.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearList}
                disabled={sending}
                className="hover: cursor-pointer rounded-lg border border-black/15 bg-black/5 px-4 py-2 text-black/70 hover:bg-black/10 disabled:opacity-30"
              >
                Clear List
              </button>
              <SeventhButton
                type="button"
                onClick={dispatchInvites}
                disabled={sending}
                className="! !px-6 !py-3 disabled:opacity-40"
              >
                {sending
                  ? " Sending Invites..."
                  : " Send Invitation Email Blasts"}
              </SeventhButton>
            </div>
          </div>

          {/* Results Toast */}
          {results && (
            <div
              className={`flex items-center gap-3 border p-4 ${results.failed > 0 ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
            >
              <span className="text-lg">{results.failed > 0 ? "" : ""}</span>
              <p>
                Dispatched: {results.success} invites sent successfully
                {results.failed > 0 && `, ${results.failed} failed`}.
              </p>
            </div>
          )}

          {/* Invite table */}
          <div className="max-h-[300px] overflow-y-auto border border-black/10 bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-black/10 bg-black/5 text-[0.65rem] text-black/70">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {invites.map((inv) => (
                  <tr
                    key={inv.email}
                    className="transition-colors hover:bg-black/[0.01]"
                  >
                    <td className="px-4 py-3.5 text-black">{inv.email}</td>
                    <td className="px-4 py-3.5 text-black/70">
                      {inv.name || <span className="text-black/30">N/A</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {inv.status === "pending" && (
                        <span className="rounded-lg bg-black/5 px-2.5 py-1 text-[0.55rem] text-black/60">
                          Pending
                        </span>
                      )}
                      {inv.status === "sending" && (
                        <span className="animate-pulse rounded-lg bg-[var(--color-accent)] px-2.5 py-1 text-[0.55rem]">
                          Sending…
                        </span>
                      )}
                      {inv.status === "success" && (
                        <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[0.55rem] text-emerald-800">
                          Sent
                        </span>
                      )}
                      {inv.status === "failed" && (
                        <span
                          title={inv.error}
                          className="cursor-help rounded-lg border border-rose-300 bg-rose-100 px-2.5 py-1 text-[0.55rem] text-rose-800"
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
