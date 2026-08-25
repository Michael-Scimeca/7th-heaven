import React from 'react';

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
  const cleanedContent = cleanWysiwygHtml(cruiseMessage || '');

  if (livePreviewTab === 'wall' || livePreviewTab === 'dashboard') {
    return (
      <div className="bg-black/60 border border-white/10  rounded-lg p-5 shadow-inner min-h-[220px]">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
            7H
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              7th Heaven Official
              <span className=" text-[12px]  bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono uppercase">Admin Post</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono">Just now • Cruise Wall Feed</div>
          </div>
        </div>
        <div
          className="prose prose-invert max-w-none text-xs text-white/90 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleanedContent || '<p class="text-white/30 italic">Start typing above to see live preview...</p>') }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900  rounded-lg overflow-hidden shadow-2xl border border-slate-300 text-xs font-sans min-h-[300px]">
      <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">📧 Email Dispatch Mockup</span>
        <span className="text-[10px] text-slate-400 font-mono">To: All Cruise Guests</span>
      </div>
      <div className="p-4 bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[11px]">
        <strong>Subject:</strong> {cruiseBlastSubject || '7th Heaven Cruise Update'}
      </div>
      <div
        className="p-6 bg-white prose max-w-none text-xs leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(
            cruiseCommunityBlast({
              subject: cruiseBlastSubject || '7th Heaven Cruise Update',
              body: cleanedContent || '<p style="color:#888;">Live email message body will appear here as you type...</p>',
            })
          ),
        }}
      />
    </div>
  );
}
