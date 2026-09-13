/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Newspaper, CheckCircle2 } from "lucide-react";
import { useMember } from "@/context/MemberContext";
import AddCmsButton from "./AddCmsButton";

export interface NewsItem {
  id?: string;
  date: string;
  title: string;
  content: string;
  category?: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    date: "January 2026",
    title: "2026 Tour Dates Announced",
    content: "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things. We are also booking more dates, so stay tuned for that. We have most of our summer booked already. Thanks for taking this musical journey with us, and we look forward to making more memories with you in 2026.",
  },
  {
    date: "January 2026",
    title: "Website Updates",
    content: "Q1 2026 dates are now on our tour page. Jukebox has been updated on the music section — added Pop Medley 5, Pop Medley 6 and Club Medley; as well as updated Pop Medley 3, added artwork to Time Has Come, Media Overkill, Pop Life and Dance Media.",
  },
  {
    date: "December 2025",
    title: "History Page Launched",
    content: "We've started building our history page, documenting 7th heaven's journey from 1985 to 2025. The 2025 page is live and we're working on the 1985 page. More years coming soon!",
  },
  {
    date: "November 2025",
    title: "Bio Page Updated",
    content: "We've refreshed the band bio to reflect our latest accomplishments and milestones. 40 years of rocking and still going strong!",
  },
];

export default function HomeNewsSection({ items, sanityContent }: { items?: NewsItem[]; sanityContent?: any }) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(isLoggedIn && (member?.role === 'admin' || member?.role === 'crew' || (member as any)?.isAdmin === true));

  const [news, setNews] = useState<NewsItem[]>(items && items.length > 0 ? items : FALLBACK_NEWS);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Add News Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("January 2026");
  const [newCategory, setNewCategory] = useState("update");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate news items live from Sanity
  useEffect(() => {
    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    setNewDate(`${months[now.getMonth()]} ${now.getFullYear()}`);

    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.news) && data.news.length > 0) {
          const sanityItems: NewsItem[] = data.news.map((sn: any) => ({
            id: sn._id,
            date: sn.date || "January 2026",
            title: sn.title,
            content: sn.content,
            category: sn.category,
          }));

          setNews((prev) => {
            const existingTitles = new Set(sanityItems.map((n) => n.title));
            const remainingFallback = prev.filter((n) => !existingTitles.has(n.title));
            return [...sanityItems, ...remainingFallback];
          });
        }
      })
      .catch(() => { });
  }, []);

  const handleAddNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newTitle.trim() || !newContent.trim()) {
      setModalError("Please provide both a Title and Content for the news post.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          date: newDate.trim(),
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const addedArticle: NewsItem = {
          id: data.article.id || data.article._id,
          title: data.article.title,
          content: data.article.content,
          date: data.article.date,
          category: data.article.category,
        };

        setNews((prev) => [addedArticle, ...prev.filter((n) => n.title !== addedArticle.title)]);
        setIsAddModalOpen(false);
        setNewTitle("");
        setNewContent("");
        setToastMessage(`🎉 News article "${addedArticle.title}" published to Sanity!`);
        setTimeout(() => setToastMessage(null), 4500);
      } else {
        setModalError(data.error || "Failed to save news article to Sanity.");
      }
    } catch {
      setModalError("Network error. Failed to save news article.");
    } finally {
      setSubmitting(false);
    }
  };

  const featured = news[0];

  return (
    <section id="news" className="site-container relative py-section-fluid">
      <>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl text-left">
            <h2 className="uppercase font-[family-name:var(--font-rockstar)]">
              {sanityContent?.newsTitle || "Latest Band News"}
            </h2>
            <p className="mt-2 text-sm md:text-base">
              {sanityContent?.newsSubtitle || "Stay updated with official announcements, tour updates, new music releases, and exclusive band stories."}
            </p>
          </div>
          {isAdmin && (
            <AddCmsButton
              label="ADD NEWS"
              onClick={() => setIsAddModalOpen(true)}
              className="self-start lg:self-auto"
            />
          )}
        </div>

        {/* Featured Article + Remaining Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Featured Article Card (Left / Top - 7 Cols) */}
          {featured && (
            <div className="lg:col-span-7 border-0 pb-4 md:pb-6 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-[var(--color-accent)]">
                  {featured.date}
                </span>
              </div>
              <h3 className="mb-4 transition-colors">
                {featured.title}
              </h3>
              <p className="font-normal">
                {featured.content}
              </p>
            </div>
          )}

          {/* Remaining Articles List (Right - 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {news.slice(1).map((item) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setSelectedArticle(item)}
                className="w-full text-left border-0 pb-3 md: pb-2 cursor-pointer group    font-normal"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--color-accent)]">
                    {item.date}
                  </span>
                  <span className="text-[var(--color-accent)] transition-colors">
                    Read
                  </span>
                </div>
                <h4 className="transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="line-clamp-2   ">
                  {item.content}
                </p>
              </button>
            ))}
          </div>
        </div>
      </>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[var(--card-bg)] border-0 max-w-xl w-full p-8 relative shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--color-accent)] uppercase">
                {selectedArticle.date}
              </span>
              <button
                aria-label="Close modal"
                onClick={() => setSelectedArticle(null)}
                className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h3 className="mb-4">
              {selectedArticle.title}
            </h3>
            <p className="whitespace-pre-line">
              {selectedArticle.content}
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gradient-to-r from-purple-900/90 to-pink-900/90 border border-purple-400/50 text-white px-6 py-3.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Add News Modal */}
      {isAddModalOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Band News to Sanity</h3>
                <p className="text-xs text-purple-300/70">Publish a new band announcement or update to Sanity CMS.</p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddNewsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. New Single Released or Summer 2026 Tour Announcement"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Display Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. September 2026"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm cursor-pointer"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="press">Press</option>
                    <option value="release">Release</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5">
                  Content / Article Body *
                </label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write the news update content here..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Publishing..." : "+ PUBLISH NEWS TO SANITY"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
