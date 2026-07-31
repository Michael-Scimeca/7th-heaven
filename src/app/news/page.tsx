import type { Metadata } from "next";
import { sanityClient, queries, SanityNewsPost } from "@/lib/sanity";
import { NewsHeroLayouts } from "@/components/NewsHeroLayouts";

export const metadata: Metadata = {
  title: "News & Updates — 7th Heaven",
  description: "Latest news, announcements, and updates from 7th Heaven — new tour dates, album releases, website updates, and band milestones.",
  openGraph: {
    title: "News & Updates — 7th Heaven",
    description: "Latest news and announcements from 7th Heaven.",
    type: "website",
    url: "https://7thheavenband.com/news",
  },
};

// Revalidate every 60 seconds — news doesn't change by the second
export const revalidate = 60;

const FALLBACK_NEWS = [
 {
 date: "January 2026",
 title: "2026 Tour Dates Announced",
 content: "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things. We are also booking more dates, so stay tuned for that. We have most of our summer booked already. Thanks for taking this musical journey with us, and we look forward to making more memories with you in 2026.",
 },
 {
 date: "January 2026",
 title: "Website Updates",
 content: "Q1 2026 dates are now on our tour page. Jukebox has been updated on the music page — added Pop Medley 5, Pop Medley 6 and Club Medley; as well as updated Pop Medley 3, added artwork to Time Has Come, Media Overkill, Pop Life and Dance Media.",
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

export default async function NewsPage() {
  const newsData = await sanityClient.fetch<SanityNewsPost[]>(queries.allNews, {}, { next: { revalidate: 60, tags: ['sanity:news'] } });
  
  const newsItems = (newsData as SanityNewsPost[]).length > 0
    ? (newsData as SanityNewsPost[]).map(item => ({
        date: item.date || new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        title: item.title,
        content: item.content
      }))
    : FALLBACK_NEWS;

  return (
    <div className="pt-[88px]">
      {/* ── BORDERLESS & BOXLESS SPLIT SHOWCASE HERO SECTION ── */}
      <section className="relative pt-[25px] pb-16 md:pb-24 overflow-hidden bg-[var(--color-bg-deep)]">
        {/* Background Concert Photo */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-1000 scale-105" 
          style={{ backgroundImage: "url('/images/hero-band-bg.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090314] via-[#090314]/90 to-[#090314]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80" />
        
        <div className="site-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column — Branding */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyan-400">
              Official Bulletins & Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mt-3 mb-4 leading-none">
              7th Heaven <br /><span className="text-cyan-400">Band News</span>
            </h1>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              Direct updates from the band — tour announcements, new releases, and live event updates.
            </p>
          </div>
          
          {/* Right Column — Featured Article (No Box, No Border) */}
          {newsItems.length > 0 && (() => {
            const featured = newsItems[0];
            return (
              <div className="lg:col-span-7 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">
                    Featured Article
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    {featured.date}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4 hover:text-cyan-300 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
                  {featured.content}
                </p>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Editorial News Layout */}
      <section className="py-16">
        <div className="site-container">
          {/* Grid of Remaining Articles */}
          {newsItems.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.slice(1).map((item, i) => (
                <article key={i} className="flex flex-col p-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-none transition-all duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card-hover)] hover:-translate-y-1 hover:shadow-xl" id={`news-item-${i + 1}`}>
                  <div className="mb-6 flex justify-between items-center">
                    <span className="inline-block px-3 py-1 text-xs tracking-widest font-bold uppercase text-[var(--color-accent)] bg-[rgba(133,29,239,0.1)] border border-[rgba(133,29,239,0.2)] rounded-none">{item.date}</span>
                  </div>
                  <h3 className="font-[var(--font-heading)] text-xl font-bold mb-4 leading-tight text-white/90 group-hover:text-white">{item.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed flex-grow line-clamp-4">{item.content}</p>
                  
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="text-white/40 hover:text-[var(--color-accent)] transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      Read More <span className="text-lg">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
