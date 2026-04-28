import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityNewsPost } from "@/lib/sanity";

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
  const { data: newsData } = await sanityFetch({ query: queries.allNews });
  
  const newsItems = (newsData as SanityNewsPost[]).length > 0
    ? (newsData as SanityNewsPost[]).map(item => ({
        date: item.date || new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        title: item.title,
        content: item.content
      }))
    : FALLBACK_NEWS;

 return (
 <div className="pt-[72px]">
 <section className="pt-24 pb-10 text-center bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
 <div className="site-container">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">Updates</span>
 <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight tracking-tight">
 Latest <span className="gradient-text">News</span>
 </h1>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mt-4">Updates, announcements, and what&apos;s happening with 7th heaven.</p>
 </div>
 </section>



 {/* Editorial News Layout */}
 <section className="py-20 bg-[var(--color-bg-primary)]">
 <div className="site-container flex flex-col gap-12">
  
  {/* Featured Article (Top Item) */}
  {newsItems.length > 0 && (() => {
   const featured = newsItems[0];
   return (
    <article className="relative overflow-hidden border border-[var(--color-accent)]/30 rounded-2xl bg-[#0a0a0e] shadow-[0_10px_40px_rgba(133,29,239,0.1)] group">
     {/* Faux Background Image / Gradient */}
     <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0b2e] via-[#0a0a0e] to-[#0a0a0e] opacity-80" />
     <div className="absolute top-0 right-0 w-2/3 h-full bg-[url('/images/hero-banner.png')] bg-cover bg-center opacity-10 mix-blend-screen group-hover:scale-105 transition-transform duration-700" />
     <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e] via-[#0a0a0e]/80 to-transparent" />
     
     <div className="relative z-10 p-10 md:p-16 lg:p-24 max-w-[800px]">
      <span className="inline-block px-3 py-1 mb-6 text-[0.75rem] font-bold tracking-widest uppercase text-white bg-[var(--color-accent)] rounded-sm">Featured</span>
      <h2 className="font-[var(--font-heading)] text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight mb-6 text-white text-balance drop-shadow-lg">{featured.title}</h2>
      <p className="text-[var(--color-text-secondary)] text-lg md:text-xl leading-relaxed mb-8 max-w-[90%]">{featured.content}</p>
      <div className="flex items-center justify-between">
       <span className="text-[0.8rem] font-semibold text-white/50 tracking-widest uppercase">{featured.date}</span>
       <button className="text-[var(--color-accent)] font-bold text-sm tracking-widest uppercase hover:text-white transition-colors flex items-center gap-2">
        Read Story <span className="text-lg">→</span>
       </button>
      </div>
     </div>
    </article>
   );
  })()}

  {/* Grid of Remaining Articles */}
  {newsItems.length > 1 && (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {newsItems.slice(1).map((item, i) => (
     <article key={i} className="flex flex-col p-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl transition-all duration-300 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card-hover)] hover:-translate-y-1 hover:shadow-xl" id={`news-item-${i + 1}`}>
      <div className="mb-6 flex justify-between items-center">
       <span className="inline-block px-3 py-1 text-[0.65rem] tracking-widest font-bold uppercase text-[var(--color-accent)] bg-[rgba(133,29,239,0.1)] border border-[rgba(133,29,239,0.2)] rounded-sm">{item.date}</span>
      </div>
      <h3 className="font-[var(--font-heading)] text-xl font-bold mb-4 leading-tight text-white/90 group-hover:text-white">{item.title}</h3>
      <p className="text-[var(--color-text-secondary)] text-[0.9rem] leading-relaxed flex-grow line-clamp-4">{item.content}</p>
      
      <div className="mt-8 pt-6 border-t border-white/5">
       <button className="text-white/40 hover:text-[var(--color-accent)] transition-colors text-[0.75rem] font-bold uppercase tracking-widest flex items-center gap-2">
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
