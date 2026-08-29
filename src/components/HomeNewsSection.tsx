"use client";

import React, { useState } from "react";

export interface NewsItem {
  date: string;
  title: string;
  content: string;
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

export default function HomeNewsSection({ items }: { items?: NewsItem[] }) {
  const newsItems = items && items.length > 0 ? items : FALLBACK_NEWS;
  const featured = newsItems[0];
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  return (
    <section id="news" className="site-container relative py-section-fluid bg-[var(--card-bg)] text-[var(--text-color)]">
      <>
        {/* Section Header */}
        <div className="mb-12 text-left">
          <h2 className="font-bold uppercase tracking-tight font-[family-name:var(--font-rockstar)]">
            Latest Band News
          </h2>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-[var(--muted-text)] font-medium leading-relaxed">
            Stay updated with official announcements, tour updates, new music releases, and exclusive band stories.
          </p>
        </div>

        {/* Featured Article + Remaining Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Featured Article Card (Left / Top - 7 Cols) */}
          {featured && (
            <div className="lg:col-span-7 border-0  pb-10 relative overflow-hidden group transition-colors">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase    text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-lg">
                  ⭐ Featured Announcement
                </span>
                <span className="font-mono text-purple-400 font-bold">
                  {featured.date}
                </span>
              </div>
              <h3 className="font-bold leading-tight mb-4 group-hover: transition-colors">
                {featured.title}
              </h3>
              <p className="leading-relaxed font-normal">
                {featured.content}
              </p>
            </div>
          )}

          {/* Remaining Articles List (Right - 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {newsItems.slice(1).map((item) => (
              <button
                type="button"
                key={item.title} onClick={() => setSelectedArticle(item)}
                className="w-full text-left border-0  pb-5 cursor-pointer  group font-sans font-normal"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase    text-[var(--color-accent)]">
                    {item.date}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--muted-text)] group-hover: text-[var(--color-accent)] transition-colors">
                    Read
                  </span>
                </div>
                <h4 className="font-bold group-hover: transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="leading-relaxed line-clamp-2 mt-1">
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
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[var(--card-bg)] border-0 max-w-xl w-full p-8 relative shadow-2xl" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">
                {selectedArticle.date}
              </span>
              <button aria-label="Action button"
                onClick={() => setSelectedArticle(null)}
                className="text-[var(--muted-text)] hover:text-[var(--text-color)] text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors"
              >
                ✕
              </button>
            </div>
            <h3 className="font-bold mb-4 leading-tight">
              {selectedArticle.title}
            </h3>
            <p className="leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
