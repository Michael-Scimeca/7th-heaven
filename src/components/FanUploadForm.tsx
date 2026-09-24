/* eslint-disable react-doctor/no-giant-component, react-doctor/no-high-complexity-react-function */
"use client";

import { useState, useRef, useEffect } from "react";
import { useMember } from "@/context/MemberContext";
import SeventhButton from "@/components/SeventhButton";
import { GlowInput } from "@/components/GlowInput";

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
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob)
              resolve(
                new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, "") + outputExt,
                  { type: outputType },
                ),
              );
            else reject(new Error("Canvas compression failed"));
          },
          outputType,
          quality,
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const moderateImage = async (
  file: File,
): Promise<"allow" | "flag" | "block"> => {
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
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(() => {
    return searchParams?.get("mockSuccess") === "true";
  });
  const [dragOver, setDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(() => {
    return searchParams?.get("mockScanning") === "true";
  });
  const [scanStatus, setScanStatus] = useState<string>(() => {
    return searchParams?.get("mockScanning") === "true"
      ? "Scanning 1/1: concert-moment.jpg"
      : "";
  });
  const [previews, setPreviews] = useState<string[]>(() => {
    return searchParams?.get("mockScanning") === "true"
      ? ["/sitemap-screenshots/fan-photo-wall.png"]
      : [];
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileSafetyFlagsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFilesChange = async (files: FileList | null | File[]) => {
    if (!isLoggedIn) {
      openModal("login");
      return;
    }
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);

    const hasImages = filesArray.some((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        file.name.endsWith(".mp4") ||
        file.name.endsWith(".mov");
      return (
        !isVideo && (file.type === "image/jpeg" || file.type === "image/png")
      );
    });

    if (hasImages) {
      setIsScanning(true);
      setScanStatus("Checking image safety…");
    }

    const compressedFiles: File[] = [];
    const newPreviews: string[] = [];
    const newFlags: Record<string, string> = {};

    const results = await Promise.all(
      filesArray.map(async (file) => {
        const isVideo =
          file.type.startsWith("video/") ||
          file.name.endsWith(".mp4") ||
          file.name.endsWith(".mov");
        const isImage = file.type === "image/jpeg" || file.type === "image/png";

        if (!isImage && !isVideo) {
          alert(
            `"${file.name}" is not a valid image (JPG, PNG) or video (MP4, MOV). It was skipped.`,
          );
          return null;
        }

        if (isVideo) {
          const previewUrl = await fileToDataUrl(file);
          return { file, preview: previewUrl, flag: "video_review" };
        }

        try {
          const compressed = await compressImage(file, 1920);
          const previewUrl = await fileToDataUrl(compressed);
          const decision = await moderateImage(compressed);

          if (decision === "block") {
            alert(
              `⛔ "${file.name}" was blocked by our safety filter.\n\nThis image appears to contain explicit content and cannot be uploaded. All submissions must be concert/event-related photos.`,
            );
            return null;
          }

          return {
            file: compressed,
            preview: previewUrl,
            flag: decision === "flag" ? "flagged_for_review" : undefined,
          };
        } catch (err) {
          console.error("Compression or scanning failed", err);
          return null;
        }
      }),
    );

    for (const res of results) {
      if (!res) continue;
      compressedFiles.push(res.file);
      newPreviews.push(res.preview);
      if (res.flag) newFlags[res.file.name] = res.flag;
    }

    setSelectedFiles((prev) => [...prev, ...compressedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    fileSafetyFlagsRef.current = { ...fileSafetyFlagsRef.current, ...newFlags };
    setIsScanning(false);
    setScanStatus("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    if (selectedFiles.length === 0) {
      alert("Please select at least one photo or video!");
      return;
    }

    const fd = new FormData(formRef.current);
    const venueValue = ((fd.get("venue") as string) || "").trim();
    const dateValue = ((fd.get("date") as string) || "").trim();

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

    fd.delete("photo");
    selectedFiles.forEach((file) => fd.append("photo", file));
    fd.append("name", member?.name || "Authorized Fan");
    // Send safety flags so the server can tag flagged uploads for priority review
    if (Object.keys(fileSafetyFlagsRef.current).length > 0) {
      fd.append("safety_flags", JSON.stringify(fileSafetyFlagsRef.current));
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
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h2>Submit to Fan Wall</h2>
          <p>Share your concert moments</p>
        </div>
      </div>

      {uploadSuccess ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/20">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="mb-2">Moments Submitted!</h3>
          <p className="mb-6">
            They are now live on your account and will appear on the global wall
            after admin review.
          </p>
          <button
            onClick={() => setUploadSuccess(false)}
            className="cursor-pointer rounded border border-[var(--color-accent)] px-6 py-2 text-[var(--color-accent)] hover:text-white"
          >
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
                  if ((e.target as HTMLElement).closest(".plus-button")) return;
                  if (!isLoggedIn) {
                    openModal("login");
                    return;
                  }
                  fileRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (previews.length > 0) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isLoggedIn) {
                      openModal("login");
                      return;
                    }
                    fileRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFilesChange(e.dataTransfer.files);
                }}
                className={`group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg ${dragOver ? "scale-[1.01] border-[var(--color-accent)] bg-[var(--color-accent)]/15" : "border-white/40 bg-[#00000029] bg-black/30 hover:border-[var(--color-accent)]"}`}
              >
                {previews.length > 0 ? (
                  <div className="absolute inset-0 z-20 grid grid-cols-3 gap-3 overflow-y-auto bg-black/90 p-4 sm:grid-cols-4 md:grid-cols-5">
                    {Array.from(previews, (src, i) => ({ src, i })).map(
                      ({ src, i }) => {
                        const file = selectedFiles[i];
                        const isVideo =
                          file &&
                          (file.type.startsWith("video/") ||
                            file.name.endsWith(".mp4") ||
                            file.name.endsWith(".mov"));
                        return (
                          <div
                            key={src}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
                          >
                            {isVideo ? (
                              <video
                                src={src}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                              >
                                <track kind="captions" />
                              </video>
                            ) : (
                              <img
                                src={src}
                                alt={`Preview ${i}`}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        );
                      },
                    )}
                    <button
                      type="button"
                      aria-label="Add more files"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                          openModal("login");
                          return;
                        }
                        fileRef.current?.click();
                      }}
                      className="plus-button flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      <span className="text-2xl font-light">+</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="pointer-events-none absolute inset-2.5 rounded-lg border-2 border-dashed border-white/10 group-hover:border-[var(--color-accent)]/50" />
                    <div className="relative z-10 flex flex-col items-center p-6 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="mb-1 group-hover:text-[var(--color-accent)]">
                        Upload Hero Moment
                      </p>
                      <p>Max file size: 10MB | HQ JPG/PNG/MP4/MOV</p>
                    </div>
                  </>
                )}
                {isScanning && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="mb-3 h-11 w-11 animate-spin rounded-lg border-2 border-white/10 border-t-emerald-500" />
                    <p>Safety Scan</p>
                    <p className="text-emerald-400">{scanStatus}</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  name="photo"
                  accept=".jpg, .jpeg, .png, .mp4, .mov, image/jpeg, image/png, video/mp4, video/quicktime"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesChange(e.target.files)}
                />
              </div>
            </div>

            <div className="flex flex-col flex-wrap items-end gap-3 p-0 lg:flex-row">
              <div className="grid w-full flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="fan-upload-venue"
                    className="mb-1.5 block px-1"
                  >
                    Venue / Event{" "}
                    <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <GlowInput
                    id="fan-upload-venue"
                    type="text"
                    name="venue"
                    placeholder="e.g. Durty Nellies"
                    required
                    aria-label="Venue or Event Name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fan-upload-date"
                    className="mb-1.5 block px-1"
                  >
                    Date <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <GlowInput
                    id="fan-upload-date"
                    type="date"
                    name="date"
                    required
                    aria-label="Date of Event"
                    className="cursor-pointer [color-scheme:dark]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="fan-upload-caption"
                    className="mb-1.5 block px-1"
                  >
                    Caption
                  </label>
                  <GlowInput
                    id="fan-upload-caption"
                    type="text"
                    name="caption"
                    placeholder="Short description..."
                    aria-label="Caption"
                  />
                </div>
              </div>

              <SeventhButton
                type={isLoggedIn ? "submit" : "button"}
                onClick={() => !isLoggedIn && openModal("login")}
                disabled={uploading || isScanning}
                icon={false}
                className="mt-2 flex h-[40px] w-full shrink-0 cursor-pointer items-center justify-center rounded-lg px-4 disabled:pointer-events-none disabled:opacity-50 lg:mt-0 lg:w-32"
              >
                {uploading
                  ? "Uploading…"
                  : isScanning
                    ? "Scanning…"
                    : "Publish"}
              </SeventhButton>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
