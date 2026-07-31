'use client';

import React, { useState, useEffect } from 'react';

export type CruiseVideoItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  poster?: string;
  description?: string;
  featured?: boolean;
  createdAt: string;
};

const CATEGORIES = [
  'Ship Tour',
  'Entertainment',
  'Staterooms & Suites',
  'Dining & Lounges',
  'Pool & Deck',
  'Destinations',
];

export default function CruiseVideoManager() {
  const [videos, setVideos] = useState<CruiseVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ship Tour');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [previewModalVideo, setPreviewModalVideo] = useState<CruiseVideoItem | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cruise/videos');
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch {
      showToast('Failed to load cruise videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      showToast('Please enter a video title and video URL');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/cruise/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          url: videoUrl,
          poster: posterUrl || '/images/cruise-hero.png',
          description,
          featured,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVideos(data.videos);
        setTitle('');
        setVideoUrl('');
        setPosterUrl('');
        setDescription('');
        setFeatured(false);
        showToast('✓ Video successfully added to Cruise Page!');
      } else {
        showToast(data.error || 'Failed to add video');
      }
    } catch {
      showToast('Error uploading video details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video from the Cruise Page?')) return;

    try {
      const res = await fetch(`/api/cruise/videos?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos(data.videos);
        showToast('✓ Video removed');
      } else {
        showToast('Failed to delete video');
      }
    } catch {
      showToast('Error deleting video');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local file preview URL
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    showToast(`Video selected: ${file.name}`);
  };

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 text-left space-y-8 shadow-xs text-black font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}



      {/* Form & Upload Area */}
      <form onSubmit={handleAddVideo} className="bg-black/[0.02] border border-black/10 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-black uppercase text-black tracking-wide mb-3 flex items-center gap-2">
          <span>➕ Add / Upload New Cruise Video</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-2xs font-bold text-black/70 uppercase mb-1">Video Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Star of the Seas Promenade Tour"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-black/20 rounded-xl px-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-cyan-600"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-2xs font-bold text-black/70 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white border border-black/20 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-cyan-600"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Video File / URL Input */}
          <div className="md:col-span-2">
            <label className="block text-2xs font-bold text-black/70 uppercase mb-1">
              Video Source (Direct File URL or Select Local File) *
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="https://... or /movie/ship-tour.mp4"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="flex-1 bg-white border border-black/20 rounded-xl px-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-cyan-600"
              />
              <label className="px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shrink-0 text-center flex items-center justify-center gap-1.5">
                <span>📁 Browse Video File</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Thumbnail Poster Image URL */}
          <div>
            <label className="block text-2xs font-bold text-black/70 uppercase mb-1">Thumbnail Poster Image URL</label>
            <input
              type="text"
              placeholder="/images/cruise-hero.png"
              value={posterUrl}
              onChange={e => setPosterUrl(e.target.value)}
              className="w-full bg-white border border-black/20 rounded-xl px-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-cyan-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-2xs font-bold text-black/70 uppercase mb-1">Short Description</label>
            <input
              type="text"
              placeholder="Highlights of the AquaDome, suites, and pool deck."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border border-black/20 rounded-xl px-4 py-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        {/* Options & Submit */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-black/10">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-black/80 font-bold">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="accent-cyan-600 w-4 h-4 rounded cursor-pointer"
            />
            <span>⭐ Feature this video on top of the Cruise Page</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {submitting ? 'Uploading...' : '💾 Save & Publish Video'}
          </button>
        </div>
      </form>

      {/* Videos List Grid */}
      <div>
        <h3 className="text-sm font-black uppercase text-black tracking-wide mb-4">
          Published Cruise Videos ({videos.length})
        </h3>

        {loading ? (
          <div className="text-center py-12 text-black/40 text-xs">Loading cruise videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-black/[0.02] border border-black/10 rounded-2xl text-black/40 text-xs">
            No cruise videos uploaded yet. Use the form above to add your first ship video!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(vid => (
              <div
                key={vid.id}
                className="bg-white border border-black/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-cyan-600 transition-all duration-300 shadow-xs"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden group">
                  {vid.poster ? (
                    <img src={vid.poster} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-50 text-cyan-800 text-3xl">🎬</div>
                  )}

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPreviewModalVideo(vid)}
                      className="w-12 h-12 rounded-full bg-cyan-600 text-white font-black text-lg flex items-center justify-center pl-1 shadow-md group-hover:scale-110 transition-all cursor-pointer"
                    >
                      ▶
                    </button>
                  </div>

                  {vid.featured && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-black text-[var(--font-size-4xs)] font-black uppercase px-2 py-0.5 rounded shadow">
                      ⭐ Featured
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 bg-white/90 text-cyan-900 text-[var(--font-size-3xs)] font-bold uppercase px-2.5 py-0.5 rounded border border-black/10">
                    {vid.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-black text-sm line-clamp-1">{vid.title}</h4>
                    {vid.description && (
                      <p className="text-black/60 text-xs line-clamp-2 mt-1">{vid.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-black/10 text-2xs text-black/50">
                    <span className="truncate max-w-[180px] font-mono">{vid.url}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="text-red-700 hover:text-red-800 font-bold uppercase tracking-wider text-2xs bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Preview */}
      {previewModalVideo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white border border-black/15 rounded-2xl p-4 overflow-hidden shadow-2xl text-black">
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-black font-extrabold text-sm">{previewModalVideo.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewModalVideo(null)}
                className="text-black/60 hover:text-black font-bold text-xs uppercase tracking-wider bg-black/5 hover:bg-black/10 px-3 py-1 rounded-xl cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <video
                src={previewModalVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
