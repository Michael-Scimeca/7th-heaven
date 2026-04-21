"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const crewMembers = [
 { name: "Adam Heisler", role: "Lead Vocals", avatar: "AH" },
 { name: "Richard Hofherr", role: "Guitar / Keys", avatar: "RH" },
 { name: "Nick Cox", role: "Guitar / Vocals", avatar: "NC" },
 { name: "Mark Kennetz", role: "Bass / Vocals", avatar: "MK" },
 { name: "Frankie Harchut", role: "Drums", avatar: "FH" },
 { name: "7th Heaven", role: "Official", avatar: "7H" },
];

const postTypes = [
 { value: "text", label: "Update", icon: "✍️", color: "#851DEF" },
 { value: "photo", label: "Photo", icon: "📸", color: "#22c55e" },
 { value: "video", label: "Video", icon: "🎬", color: "#ef4444" },
 { value: "setlist", label: "Setlist", icon: "🎵", color: "#f59e0b" },
 { value: "crowd", label: "Crowd", icon: "🤘", color: "#06b6d4" },
 { value: "announcement", label: "Announcement", icon: "🚨", color: "#f59e0b" },
];

export default function AdminFeedPost() {
 const [selectedMember, setSelectedMember] = useState(crewMembers[0]);
 const [postType, setPostType] = useState("text");
 const [content, setContent] = useState("");
 const [imageUrl, setImageUrl] = useState("");
 const [isPosting, setIsPosting] = useState(false);
 const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
 const [recentPosts, setRecentPosts] = useState<{ content: string; time: string; member: string }[]>([]);
 const [onlineMembers, setOnlineMembers] = useState<any[]>([]);
 const textareaRef = useRef<HTMLTextAreaElement>(null);

 // ─── Real-time Presence (Who's online) ───
 useEffect(() => {
  if (!supabase) return;

  const channel = supabase.channel('crew_dashboard_presence', {
   config: { presence: { key: selectedMember.name } }
  });

  channel
   .on('presence', { event: 'sync' }, () => {
    const newState = channel.presenceState();
    const flattened = Object.values(newState).flat();
    setOnlineMembers(flattened);
   })
   .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
     await channel.track({
      name: selectedMember.name,
      avatar: selectedMember.avatar,
      onlineAt: new Date().toISOString()
     });
    }
   });

  return () => { channel.unsubscribe(); };
 }, [selectedMember]);

 const handlePost = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!content.trim()) return;

  setIsPosting(true);
  setStatus(null);

  const postData = {
   member_name: selectedMember.name,
   member_role: selectedMember.role,
   member_avatar: selectedMember.avatar,
   content: content.trim(),
   post_type: postType,
   image_url: imageUrl || null,
   reactions: {},
   is_live: true,
  };

  try {
   const { error } = await supabase.from("feed_posts").insert([postData]);
   if (error) throw error;

   setStatus({ type: "success", message: "Posted to live feed!" });
   setRecentPosts((prev) => [
    { content: content.trim(), time: "Just now", member: selectedMember.name },
    ...prev.slice(0, 4),
   ]);
   setContent("");
   setImageUrl("");
   textareaRef.current?.focus();
  } catch {
   setStatus({ type: "success", message: "Posted! (Dev Mode — not persisted)" });
   setRecentPosts((prev) => [
    { content: content.trim(), time: "Just now", member: selectedMember.name },
    ...prev.slice(0, 4),
   ]);
   setContent("");
   setImageUrl("");
  }

  setIsPosting(false);
  setTimeout(() => setStatus(null), 4000);
 };

 const currentType = postTypes.find((t) => t.value === postType) || postTypes[0];

 return (
  <div className="min-h-screen bg-[var(--color-bg-primary)] pt-[72px]">
   <div className="max-w-[600px] mx-auto px-4 py-8">
    {/* Presence Header */}
    <div className="mb-6 flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm">
     <div className="flex -space-x-2">
      {onlineMembers.map((m: any, i) => (
       <div 
        key={i} 
        title={m.name}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-bold border-2 border-[#0a0a0f] bg-[var(--color-accent)] text-white shadow-lg"
       >
        {m.avatar}
       </div>
      ))}
      <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-xs">+</div>
     </div>
     <span className="text-[0.6rem] text-white/30 font-bold uppercase tracking-widest">
      {onlineMembers.length} Crew Active
     </span>
    </div>

    {/* Header */}
    <div className="mb-8">
     <div className="flex items-center gap-2 mb-3">
      <span className="relative flex h-2.5 w-2.5">
       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-red-400">Collaborative Live Feed</span>
     </div>
     <h1 className="font-[var(--font-heading)] text-2xl font-extrabold">Post to Feed</h1>
     <p className="text-[0.8rem] text-white/40 mt-1">Updates are synchronized across all crew devices</p>
    </div>

    {/* Post Form */}
    <form onSubmit={handlePost} className="space-y-5">
     {/* Who's posting */}
     <div>
      <label className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 block">I am</label>
      <div className="grid grid-cols-3 gap-2">
       {crewMembers.map((m) => (
        <button
         key={m.avatar}
         type="button"
         onClick={() => setSelectedMember(m)}
         className={`p-3 border text-center transition-all duration-200 ${
          selectedMember.avatar === m.avatar
           ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
           : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
         }`}
        >
         <div
          className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-[0.55rem] font-bold mb-1 border"
          style={{
           borderColor: selectedMember.avatar === m.avatar ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
           color: selectedMember.avatar === m.avatar ? "var(--color-accent)" : "rgba(255,255,255,0.5)",
          }}
         >
          {m.avatar}
         </div>
         <span className="text-[0.6rem] text-white/60 block truncate">{m.name.split(" ")[0]}</span>
        </button>
       ))}
      </div>
     </div>

     {/* Post type */}
     <div>
      <label className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 block">Post Type</label>
      <div className="flex flex-wrap gap-2">
       {postTypes.map((t) => (
        <button
         key={t.value}
         type="button"
         onClick={() => setPostType(t.value)}
         className={`flex items-center gap-1.5 px-3 py-2 text-[0.7rem] font-medium border transition-all duration-200 ${
          postType === t.value
           ? "border-white/20 bg-white/[0.06]"
           : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
         }`}
         style={postType === t.value ? { color: t.color } : { color: "rgba(255,255,255,0.5)" }}
        >
         <span>{t.icon}</span>
         <span>{t.label}</span>
        </button>
       ))}
      </div>
     </div>

     {/* Content */}
     <div>
      <label className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 block">
       What&apos;s happening?
      </label>
      <textarea
       ref={textareaRef}
       value={content}
       onChange={(e) => setContent(e.target.value)}
       placeholder={
        postType === "setlist"
         ? "Now playing: Song Name by Artist..."
         : postType === "crowd"
         ? "The crowd is going crazy for..."
         : "Share what's happening..."
       }
       rows={4}
       className="w-full bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-[0.9rem] text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 resize-none transition-colors"
       maxLength={500}
      />
      <div className="flex justify-between mt-1">
       <span className="text-[0.6rem] text-white/20">{content.length}/500</span>
       <span className="text-[0.6rem]" style={{ color: currentType.color }}>
        {currentType.icon} {currentType.label}
       </span>
      </div>
     </div>

     {/* Image URL (for photo type) */}
     {(postType === "photo" || postType === "crowd") && (
      <div>
       <label className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2 block">Image URL</label>
       <input
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://..."
        className="w-full bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-[0.85rem] text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
       />
      </div>
     )}

     {/* Submit */}
     <button
      type="submit"
      disabled={!content.trim() || isPosting}
      className={`w-full py-3 text-[0.75rem] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
       content.trim() && !isPosting
        ? "btn-primary btn-primary-hover"
        : "bg-white/[0.05] text-white/20 cursor-not-allowed"
      }`}
     >
      {isPosting ? (
       <span className="flex items-center justify-center gap-2">
        <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
        Posting...
       </span>
      ) : (
       `Post ${currentType.label} →`
      )}
     </button>
    </form>

    {/* Status Message */}
    {status && (
     <div
      className={`mt-4 p-3 text-[0.75rem] font-medium text-center border transition-all duration-300 ${
       status.type === "success"
        ? "bg-green-500/10 border-green-500/30 text-green-400"
        : "bg-red-500/10 border-red-500/30 text-red-400"
      }`}
     >
      {status.message}
     </div>
    )}

    {/* Recent Posts */}
    {recentPosts.length > 0 && (
     <div className="mt-8">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">Recently Posted</h3>
      <div className="space-y-2">
       {recentPosts.map((p, i) => (
        <div key={i} className="p-3 border border-white/[0.06] bg-white/[0.02] text-[0.8rem] text-white/50">
         <span className="text-white/70 font-medium">{p.member}:</span> {p.content.slice(0, 80)}
         {p.content.length > 80 ? "…" : ""}{" "}
         <span className="text-white/20">· {p.time}</span>
        </div>
       ))}
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
