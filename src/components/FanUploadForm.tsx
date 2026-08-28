/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useRef, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import CosmicRadialButton from "@/components/CosmicRadialButton";

const fileToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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
  const fileSafetyFlagsRef = useRef<Record<string, string>>({});

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

    const results = await Promise.all(
      filesArray.map(async (file) => {
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
        const isImage = file.type === 'image/jpeg' || file.type === 'image/png';

        if (!isImage && !isVideo) {
          alert(`"${file.name}" is not a valid image (JPG, PNG) or video (MP4, MOV). It was skipped.`);
          return null;
        }

        if (isVideo) {
          const previewUrl = await fileToDataUrl(file);
          return { file, preview: previewUrl, flag: 'video_review' };
        }

        try {
          const compressed = await compressImage(file, 1920);
          const previewUrl = await fileToDataUrl(compressed);
          const decision = await moderateImage(compressed);

          if (decision === "block") {
            alert(`⛔ "${file.name}" was blocked by our safety filter.\n\nThis image appears to contain explicit content and cannot be uploaded. All submissions must be concert/event-related photos.`);
            return null;
          }

          return {
            file: compressed,
            preview: previewUrl,
            flag: decision === "flag" ? 'flagged_for_review' : undefined,
          };
        } catch (err) {
          console.error("Compression or scanning failed", err);
          return null;
        }
      })
    );

    for (const res of results) {
      if (!res) continue;
      compressedFiles.push(res.file);
      newPreviews.push(res.preview);
      if (res.flag) newFlags[res.file.name] = res.flag;
    }

    setSelectedFiles(prev => [...prev, ...compressedFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    fileSafetyFlagsRef.current = { ...fileSafetyFlagsRef.current, ...newFlags };
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
    if (Object.keys(fileSafetyFlagsRef.current).length > 0) {
      fd.append('safety_flags', JSON.stringify(fileSafetyFlagsRef.current));
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
    <div className="text-[var(--text-color)]">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-color)]">Submit to <span className="gradient-text">Fan Wall</span></h2>
          <p className="mt-1 uppercase tracking-widest font-bold">Share your concert moments</p>
        </div>
      </div>

      {uploadSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-accent)]/20 flex items-center justify-center border border-[var(--color-accent)]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">Moments Submitted!</h3>
          <p className="mb-6">They are now live on your account and will appear on the global wall after admin review.</p>
          <button aria-label="Action button" onClick={() => setUploadSuccess(false)} className="text-[var(--color-accent)] font-bold hover:text-white transition-colors cursor-pointer border border-[var(--color-accent)] px-6 py-2 rounded">
            Upload Another
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div>
              <div
                role={previews.length === 0 ? "button" : undefined}
                tabIndex={previews.length === 0 ? 0 : undefined}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.plus-button')) return;
                  if (!isLoggedIn) { openModal('login'); return; }
                  fileRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (previews.length > 0) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!isLoggedIn) { openModal('login'); return; }
                    fileRef.current?.click();
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFilesChange(e.dataTransfer.files); }}
                className={`relative w-full transition-all duration-200 cursor-pointer flex items-center justify-center overflow-hidden rounded-lg group ${dragOver ?"border-[var(--color-accent)] bg-[var(--color-accent)]/15 scale-[1.01]" : "border-white/40 hover:border-[var(--color-accent)] bg-black/30 hover: bg-[#00000029]   "
                  }`}
              >
                {previews.length > 0 ? (
                  <div className="absolute inset-0 p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto bg-black/90 z-20">
                    {Array.from(previews, (src, i) => ({ src, i })).map(({ src, i }) => {
                      const file = selectedFiles[i];
                      const isVideo = file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov'));
                      return (
                        <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                          {isVideo ? (
                            <video src={src} className="w-full h-full object-cover" muted playsInline>
                              <track kind="captions" />
                            </video>
                          ) : (
                            <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                      );
                    })}
                    <button type="button"
                      aria-label="Add more files"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) { openModal('login'); return; }
                        fileRef.current?.click();
                      }}
                      className="plus-button aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="text-2xl font-light">+</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-2.5 border-2 border-dashed border-white/10 rounded-lg pointer-events-none group-hover:border-[var(--color-accent)]/50 transition-colors" />
                    <div className="text-center p-6 relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/40 flex items-center justify-center mb-3 text-[var(--color-accent)] shadow-[0_0_25px_rgba(255,10,61,0.2)] group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="font-bold tracking-widest uppercase mb-1 group-hover:text-[var(--color-accent)] transition-colors">Upload Hero Moment</p>
                      <p className="uppercase tracking-[0.1em]">Max file size: 10MB | HQ JPG/PNG/MP4/MOV</p>
                    </div>
                  </>
                )}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-lg animate-spin mb-3" />
                    <p className="font-bold uppercase tracking-widest">Safety Scan</p>
                    <p className="text-emerald-400 uppercase tracking-widest mt-1">{scanStatus}</p>
                  </div>
                )}
                <input aria-label="Input field" ref={fileRef} type="file" name="photo" accept=".jpg, .jpeg, .png, .mp4, .mov, image/jpeg, image/png, video/mp4, video/quicktime" multiple className="hidden" onChange={(e) => handleFilesChange(e.target.files)} />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap items-end gap-3 p-0">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fan-upload-venue" className="font-bold uppercase tracking-[0.15em] text-[var(--muted-text)] block mb-1.5 px-1">Venue / Event <span className=" text-[var(--color-accent)]">*</span></label>
                  <div>
                    <input aria-label="Input field" id="fan-upload-venue" type="text" name="venue" placeholder="e.g. Durty Nellies" required
                      className="w-full bg-[#00000029] !border-0 !border-none !outline-none px-4 py-2.5 text-white placeholder:text-white/40 focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                      style={{ border: '0', outline: 'none', borderRadius: 0 }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="fan-upload-date" className="font-bold uppercase tracking-[0.15em] text-[var(--muted-text)] block mb-1.5 px-1">Date <span className=" text-[var(--color-accent)]">*</span></label>
                  <div>
                    <input aria-label="Input field" id="fan-upload-date" type="date" name="date" required
                      className="w-full bg-[#00000029] !border-0 !border-none !outline-none px-4 py-2.5 text-white focus:ring-1 focus:ring-[var(--color-accent)] transition-all [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer"
                      style={{ border: '0', outline: 'none', borderRadius: 0 }}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="fan-upload-caption" className="font-bold uppercase tracking-[0.15em] text-[var(--muted-text)] block mb-1.5 px-1">Caption</label>
                  <div>
                    <input aria-label="Input field" id="fan-upload-caption" type="text" name="caption" placeholder="Short description..."
                      className="w-full bg-[#00000029] !border-0 !border-none !outline-none px-4 py-2.5 text-white placeholder:text-white/40 focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                      style={{ border: '0', outline: 'none', borderRadius: 0 }}
                    />
                  </div>
                </div>
              </div>




              <CosmicRadialButton
                type={isLoggedIn ? "submit" : "button"}
                onClick={() => !isLoggedIn && openModal('login')}
                disabled={uploading || isScanning}
                icon={false}
                className="w-full lg:w-32 shrink-0 flex items-center justify-center text-white font-bold uppercase tracking-[0.15em] h-[40px] px-4 rounded-lg disabled:opacity-50 disabled:pointer-events-none mt-2 lg:mt-0 cursor-pointer"
              >
                {uploading ? "Uploading…" : isScanning ? "Scanning…" : "Publish"}
              </CosmicRadialButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
