"use client";

/** The newest news post under the hero title: title, paragraph and a read more button. */

import Link from "next/link";
import { useEffect, useState } from "react";

interface LatestNews {
  date: string;
  title: string;
  content: string;
  href: string;
}

const toSlug = (title: string) =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* Matches the first post in the news section, for when no posts come back */
const FALLBACK: LatestNews = {
  date: "January 2026",
  title: "2026 Tour Dates Announced",
  content:
    "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things. We are also booking more dates, so stay tuned for that. We have most of our summer booked already. Thanks for taking this musical journey with us, and we look forward to making more memories with you in 2026.",
  href: `/news/${toSlug("2026 Tour Dates Announced")}`,
};

export default function HeroLatestNews() {
  const [news, setNews] = useState<LatestNews | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const first = data?.success && Array.isArray(data.news) ? data.news[0] : null;
        setNews(
          first
            ? {
                date: first.date || "",
                title: first.title,
                content: first.content || "",
                href: `/news/${first.slug?.current || first._id || toSlug(first.title)}`,
              }
            : FALLBACK,
        );
      })
      .catch(() => {
        if (!cancelled) setNews(FALLBACK);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!news) return null;

  return (
    <article className="hero-latest-news mt-4 flex max-w-[640px] flex-col items-start gap-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Latest news</span>
        {news.date && <span className="text-sm text-zinc-300">{news.date}</span>}
      </div>
      <h2 className="m-0 font-sans text-lg font-semibold text-amber-50 lg:text-xl">{news.title}</h2>
      {news.content && <p className="m-0 line-clamp-2 text-sm leading-relaxed text-zinc-200 lg:text-base">{news.content}</p>}
      <Link
        href={news.href}
        aria-label={`Read more: ${news.title}`}
        className="mt-1 inline-flex min-h-10 items-center rounded-full bg-[#f5b942] px-5 text-sm font-semibold !text-[#14101c] no-underline transition-colors hover:bg-[#fffbb5]"
      >
        Read more
      </Link>
    </article>
  );
}
