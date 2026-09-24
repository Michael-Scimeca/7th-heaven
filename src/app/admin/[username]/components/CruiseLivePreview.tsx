import React from "react";

interface CruiseLivePreviewProps {
  livePreviewTab: string;
  cruiseBlastSubject: string;
  cruiseMessage: string;
  sanitizeHtml: (html: string) => string;
  cleanWysiwygHtml: (html: string) => string;
  cruiseCommunityBlast: (options: any) => string;
}

export function CruiseLivePreview({
  livePreviewTab,
  cruiseBlastSubject,
  cruiseMessage,
  sanitizeHtml,
  cleanWysiwygHtml,
  cruiseCommunityBlast,
}: CruiseLivePreviewProps) {
  const cleanedContent = cleanWysiwygHtml(cruiseMessage || "");

  if (livePreviewTab === "wall" || livePreviewTab === "dashboard") {
    return (
      <div className="min-h-[220px] rounded-lg border border-white/10 bg-black/60 p-5 shadow-inner">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-3">
          <div className="bg- purple-white/20 flex h-11 w-11 items-center justify-center rounded-lg border border-purple-500/40">
            7H
          </div>
          <div>
            <div className="flex items-center gap-2">
              7th Heaven Official
              <span className="bg- purple-white/20 rounded px-1.5 py-0.5 text-[12px]">
                Admin Post
              </span>
            </div>
            <div className="text-[10px] text-white/40">
              Just now • Cruise Wall Feed
            </div>
          </div>
        </div>
        <div
          className="prose prose-invert /90 max-w-none"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(
              cleanedContent ||
                '<p class="">Start typing above to see live preview...</p>',
            ),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[300px] overflow-hidden rounded-lg border border-white/10 bg-[#0f0a1c]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#180e2b] px-4 py-2.5">
        <span>📧 Email Dispatch Mockup</span>
        <span className="text-[10px] text-white/50">To: All Cruise Guests</span>
      </div>
      <div className="border-b border-white/10 bg-[#140b24] p-4 text-purple-200">
        <strong>Subject:</strong>{" "}
        {cruiseBlastSubject || "7th Heaven Cruise Update"}
      </div>
      <div
        className="prose prose-invert /90 max-w-none bg-[#090412] p-6"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(
            cruiseCommunityBlast({
              subject: cruiseBlastSubject || "7th Heaven Cruise Update",
              body:
                cleanedContent ||
                '<p style="color:#888;">Live email message body will appear here as you type...</p>',
            }),
          ),
        }}
      />
    </div>
  );
}
