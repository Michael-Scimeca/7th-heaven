"use client";

import { useState, useRef, useEffect } from "react";
import { useMember } from "@/context/MemberContext";

export default function FanUploadForm() {
  const { member, isLoggedIn, openModal } = useMember();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(() => {
    return searchParams?.get("mockSuccess") === "true";
  });
  const [dragOver, setDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(() => {
    return searchParams?.get("mockScanning") === "true";
  });
  const [scanStatus, setScanStatus] = useState<string>(() => {
    return searchParams?.get("mockScanning") === "true" ? "Scanning 1/1: concert-moment.jpg" : "";
  });
  const [previews, setPreviews] = useState<string[]>(() => {
    return searchParams?.get("mockScanning") === "true" ? ["/sitemap-screenshots/fan-photo-wall.png"] : [];
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileSafetyFlags, setFileSafetyFlags] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      previews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const compressImage = async (file: File, maxWidth = 1920): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const outputExt = file.type === "image/png" ? ".png" : ".jpg";
      const quality = outputType === "image/jpeg" ? 0.8 : undefined;

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + outputExt, { type: outputType }));
            else reject(new Error('Canvas compression failed'));
          }, outputType, quality);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Sends a single image file to the server-side Hive Moderation proxy.
   * Returns "allow" | "flag" | "block".
   * Never throws — fails open ("allow") if the endpoint is unreachable.
   */
  const moderateImage = async (file: File): Promise<"allow" | "flag" | "block"> => {
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/fans/moderate", { method: "POST", body: fd });
      if (!res.ok) return "allow";
      const data = await res.json();
      return data.action ?? "allow";
    } catch {
      return "allow";
    }
  };

  const handleFilesChange = async (files: FileList | null | File[]) => {
    if (!isLoggedIn) {
      openModal('login');
      return;
    }
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);

    const hasImages = filesArray.some(file => {
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
      return !isVideo && (file.type === 'image/jpeg' || file.type === 'image/png');
    });

    if (hasImages) {
      setIsScanning(true);
      setScanStatus('Checking image safety…');
    }

    const compressedFiles: File[] = [];
    const newPreviews: string[] = [];
    const newFlags: Record<string, string> = {};

    for (let fi = 0; fi < filesArray.length; fi++) {
      const file = filesArray[fi];
      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png';

      if (!isImage && !isVideo) {
        alert(`"${file.name}" is not a valid image (JPG, PNG) or video (MP4, MOV). It was skipped.`);
        continue;
      }

      if (isVideo) {
        // Videos are not scanned client-side — they go straight to admin review
        const objectUrl = URL.createObjectURL(file);
        compressedFiles.push(file);
        newPreviews.push(objectUrl);
        newFlags[file.name] = 'video_review';
        continue;
      }

      setScanStatus(`Scanning ${fi + 1}/${filesArray.length}: ${file.name}`);
      try {
        const compressed = await compressImage(file, 1920);
        const objectUrl = URL.createObjectURL(compressed);

        try {
          // ── Hive Moderation (server-side) ────────────────────────────
          const decision = await moderateImage(compressed);

          if (decision === "block") {
            alert(`⛔ "${file.name}" was blocked by our safety filter.\n\nThis image appears to contain explicit content and cannot be uploaded. All submissions must be concert/event-related photos.`);
            URL.revokeObjectURL(objectUrl);
            continue;
          }

          compressedFiles.push(compressed);
          newPreviews.push(objectUrl);

          if (decision === "flag") {
            newFlags[compressed.name] = 'flagged_for_review';
          }
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          throw err;
        }
      } catch (err) {
        console.error("Compression or scanning failed", err);
      }
    }

    setSelectedFiles(prev => [...prev, ...compressedFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setFileSafetyFlags(prev => ({ ...prev, ...newFlags }));
    setIsScanning(false);
    setScanStatus('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    if (selectedFiles.length === 0) {
      alert("Please select at least one photo or video!");
      return;
    }

    const fd = new FormData(formRef.current);
    const venueValue = (fd.get("venue") as string || '').trim();
    const dateValue = (fd.get("date") as string || '').trim();

    if (!venueValue) {
      alert("Please enter a venue or event name.");
      return;
    }
    if (!dateValue) {
      alert("Please select a date.");
      return;
    }

    // Create date at noon UTC to avoid timezone issues with YYYY-MM-DD
    const showDate = new Date(dateValue + "T12:00:00Z").getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - showDate > SEVEN_DAYS_MS) {
      alert("Uploads are locked for shows that occurred more than 7 days ago.");
      return;
    }

    setUploading(true);

    fd.delete('photo');
    selectedFiles.forEach(file => fd.append('photo', file));
    fd.append('name', member?.name || 'Authorized Fan');
    // Send safety flags so the server can tag flagged uploads for priority review
    if (Object.keys(fileSafetyFlags).length > 0) {
      fd.append('safety_flags', JSON.stringify(fileSafetyFlags));
    }

    try {
      const res = await fetch("/api/fans", { method: "POST", body: fd });
      if (res.ok) {
        setUploadSuccess(true);
        setPreviews([]);
        setSelectedFiles([]);
        formRef.current.reset();
        window.location.reload();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-black/10 bg-white p-6 lg:p-8 shadow-md text-black">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/50 flex flex-col items-center justify-center text-black">📸</span>
        <div>
          <h2 className="text-xl font-bold text-black">Submit to <span className="gradient-text">Fan Wall</span></h2>
          <p className="text-xs text-black/50 mt-1 uppercase tracking-widest font-bold">Share your concert moments</p>
        </div>
      </div>

      {uploadSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-accent)]/20 flex items-center justify-center border border-[var(--color-accent)]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Moments Submitted!</h3>
          <p className="text-black/60 text-base mb-6">They are now live on your account and will appear on the global wall after admin review.</p>
          <button onClick={() => setUploadSuccess(false)} className=" text-[var(--color-accent)] text-sm font-bold hover:text-black transition-colors cursor-pointer border border-[var(--color-accent)] px-6 py-2 rounded">
            Upload Another
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div>
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.plus-button')) return;
                  if (!isLoggedIn) { openModal('login'); return; }
                  fileRef.current?.click();
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFilesChange(e.dataTransfer.files); }}
                className={`relative w-full h-48 border border-black/15 cursor-pointer flex items-center justify-center overflow-hidden transition-colors ${dragOver ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "hover:border-[var(--color-accent)]/50 bg-gray-50"
                  }`}
              >
                {previews.length > 0 ? (
                  <div className="absolute inset-0 p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto bg-white/90 z-20">
                    {previews.map((src, i) => {
                      const file = selectedFiles[i];
                      const isVideo = file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov'));
                      return (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-black/10 group">
                          {isVideo ? (
                            <video src={src} className="w-full h-full object-cover" muted playsInline />
                          ) : (
                            <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                      );
                    })}
                    <div
                      onClick={() => {
                        if (!isLoggedIn) { openModal('login'); return; }
                        fileRef.current?.click();
                      }}
                      className="plus-button aspect-square rounded-lg border-2 border-dashed border-black/20 flex flex-col items-center justify-center text-black/40 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                    >
                      <span className="text-2xl font-light">+</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mb-4  text-[var(--color-accent)] shadow-[0_0_30px_rgba(255,10,61,0.15)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-black font-black tracking-widest uppercase mb-1 text-sm">Upload Hero Moment</p>
                    <p className="text-xs text-black/40 uppercase tracking-[0.1em]">Max file size: 10MB | HQ JPG/PNG/MP4/MOV</p>
                  </div>
                )}
                {previews.length === 0 && !isScanning && <div className="absolute inset-0 border-[2px] border-dashed border-black/10 m-2 pointer-events-none" />}
                {isScanning && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <div className="w-10 h-10 border-2  border-[var(--color-accent)]/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
                    <p className="text-black font-black text-sm uppercase tracking-widest">Safety Scan</p>
                    <p className="text-emerald-600 text-xs uppercase tracking-widest mt-1">{scanStatus}</p>
                  </div>
                )}
                <input ref={fileRef} type="file" name="photo" accept=".jpg, .jpeg, .png, .mp4, .mov, image/jpeg, image/png, video/mp4, video/quicktime" multiple className="hidden" onChange={(e) => handleFilesChange(e.target.files)} />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap items-end gap-3 bg-gray-50 border border-black/10 p-4">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-black/70 block mb-1.5 px-1">Venue / Event <span className=" text-[var(--color-accent)]">*</span></label>
                  <input type="text" name="venue" placeholder="e.g. Durty Nellies" required
                    className="w-full bg-white border border-black/15 rounded-lg px-4 py-2.5 text-sm text-black placeholder:text-black/40 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-black/70 block mb-1.5 px-1">Date <span className=" text-[var(--color-accent)]">*</span></label>
                  <input type="date" name="date" required
                    className="w-full bg-white border border-black/15 rounded-lg px-4 py-2.5 text-sm text-black focus:border-[var(--color-accent)] focus:outline-none transition-colors [color-scheme:light]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-black/70 block mb-1.5 px-1">Caption</label>
                  <input type="text" name="caption" placeholder="Short description..."
                    className="w-full bg-white border border-black/15 rounded-lg px-4 py-2.5 text-sm text-black placeholder:text-black/40 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 mt-1 px-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/30 mt-0.5 shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <p className="text-xs text-black/50 leading-relaxed">
                  By uploading, you grant 7th Heaven a perpetual, royalty-free, worldwide license to use, reproduce, modify, and display your submitted photo(s) for promotional, social media, and commercial purposes. You confirm you own the rights to the image or have permission from the rights holder.
                </p>
              </div>

              <button
                type={isLoggedIn ? "submit" : "button"}
                onClick={() => !isLoggedIn && openModal('login')}
                disabled={uploading || isScanning}
                className="w-full lg:w-32 shrink-0 flex items-center justify-center bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 hover:scale-[1.02] active:scale-95 text-white font-black text-sm uppercase tracking-[0.15em] h-[40px] px-4 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none mt-2 lg:mt-0"
              >
                {uploading ? "Uploading…" : isScanning ? "Scanning…" : "Publish"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
