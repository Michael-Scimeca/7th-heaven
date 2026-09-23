import { notFound } from "next/navigation";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import SeventhButton from "@/components/SeventhButton";
import { sanityClient } from "@/lib/sanity";
import { ArrowLeft, ArrowRight, Calendar, Tag, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

interface NewsPost {
  _id: string;
  title: string;
  content: string;
  date?: string;
  category?: string;
  publishedAt?: string;
  slug?: string;
}

// Fallback articles for non-Sanity items (keyed by slug derived from title)
const FALLBACK_NEWS: NewsPost[] = [
  {
    _id: "2026-tour-dates-announced",
    date: "January 2026",
    title: "2026 Tour Dates Announced",
    content:
      "It's winter time, and besides our annual cruise we do every year, we are working in the studio on numerous things. We are also booking more dates, so stay tuned for that. We have most of our summer booked already. Thanks for taking this musical journey with us, and we look forward to making more memories with you in 2026.",
    category: "announcement",
  },
  {
    _id: "website-updates",
    date: "January 2026",
    title: "Website Updates",
    content:
      "Q1 2026 dates are now on our tour page. Jukebox has been updated on the music section — added Pop Medley 5, Pop Medley 6 and Club Medley; as well as updated Pop Medley 3, added artwork to Time Has Come, Media Overkill, Pop Life and Dance Media.",
    category: "update",
  },
  {
    _id: "history-page-launched",
    date: "December 2025",
    title: "History Page Launched",
    content:
      "We've started building our history page, documenting 7th heaven's journey from 1985 to 2025. The 2025 page is live and we're working on the 1985 page. More years coming soon!",
    category: "update",
  },
  {
    _id: "bio-page-updated",
    date: "November 2025",
    title: "Bio Page Updated",
    content:
      "We've refreshed the band bio to reflect our latest accomplishments and milestones. 40 years of rocking and still going strong!",
    category: "update",
  },
];

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "Announcement",
  update: "Update",
  press: "Press",
  release: "Release",
};

async function getArticle(slug: string): Promise<NewsPost | null> {
  // Try Sanity first (by _id or slug field)
  try {
    const [byId, bySlug] = await Promise.all([
      sanityClient.fetch<NewsPost | null>(
        `*[_type == "newsPost" && _id == $id][0] { _id, title, content, date, category, publishedAt, "slug": slug.current }`,
        { id: slug }
      ),
      sanityClient.fetch<NewsPost | null>(
        `*[_type == "newsPost" && slug.current == $slug][0] { _id, title, content, date, category, publishedAt, "slug": slug.current }`,
        { slug }
      ),
    ]);
    if (byId ?? bySlug) return byId ?? bySlug;
  } catch {
    // fall through to fallback
  }

  // Check fallback list
  return FALLBACK_NEWS.find((n) => toSlug(n.title) === slug || n._id === slug) ?? null;
}

async function getOtherArticles(currentArticle: NewsPost, currentSlug: string): Promise<NewsPost[]> {
  let sanityPosts: NewsPost[] = [];
  try {
    sanityPosts = await sanityClient.fetch<NewsPost[]>(
      `*[_type == "newsPost"] | order(publishedAt desc) { _id, title, content, date, category, publishedAt, "slug": slug.current }`
    );
  } catch {
    sanityPosts = [];
  }

  const allPosts: NewsPost[] = [...sanityPosts];
  const sanityTitles = new Set(sanityPosts.map((p) => p.title));
  for (const fb of FALLBACK_NEWS) {
    if (!sanityTitles.has(fb.title)) {
      allPosts.push(fb);
    }
  }

  return allPosts.filter(
    (item) =>
      item._id !== currentArticle._id &&
      toSlug(item.title) !== toSlug(currentArticle.title) &&
      item._id !== currentSlug &&
      toSlug(item.title) !== currentSlug
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "News Article | 7th Heaven" };
  return {
    title: `${article.title} | 7th Heaven News`,
    description: article.content.slice(0, 160),
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const otherArticles = await getOtherArticles(article, slug);

  const categoryLabel = CATEGORY_LABELS[article.category ?? ""] ?? article.category ?? "";

  return (
    <main className="min-h-screen page-container">
      {/* Top nav bar */}
      <div className="site-container py-3">
        <Link
          href="/#news"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm  "
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>
      </div>

      {/* Article */}
      <article className="site-container pb-24">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {article.date && (
            <span className="inline-flex items-center gap-1.5 text-sm  ">
              <Calendar className="w-3.5 h-3.5" />
              {article.date}
            </span>
          )}
          {categoryLabel && (
            <span className="inline-flex items-center gap-1.5 text-xs    px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300">
              <Tag className="w-3 h-3" />
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="max-w-3xl mb-4">{article.title}</h1>

        {/* Body */}
        <div className="max-w-2xl space-y-5">
          {article.content.split("\n").map((paragraph) =>
            paragraph.trim() ? (
              <p key={`para-${paragraph.slice(0, 24)}`} className="  leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </div>

        {/* Footer CTA */}
        <div className="mt-6 border-t border-white/10 pt-6 flex flex-wrap gap-4">
          <TransitionLink href="/#news">
            <SeventhButton className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>ALL NEWS</span>
            </SeventhButton>
          </TransitionLink>
          <TransitionLink href="/shows">
            <SeventhButton className="flex items-center gap-2">
              <span>VIEW TOUR DATES</span>
            </SeventhButton>
          </TransitionLink>
        </div>

        {/* Other Articles Section */}
        {otherArticles.length > 0 && (
          <section className="mt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl    flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[var(--color-accent)]" />
                  Other Articles
                </h2>
                <p className="text-sm text-purple-200/70 mt-1">
                  Explore more updates, tour announcements, and news from 7th heaven
                </p>
              </div>
              <Link
                href="/#news"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm   text-purple-300 hover:text-white transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((other) => {
                const itemSlug = other.slug || other._id || toSlug(other.title);
                const category = CATEGORY_LABELS[other.category ?? ""] ?? other.category ?? "";
                return (
                  <Link
                    key={other._id || other.title}
                    href={`/news/${itemSlug}`}
                    className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {other.date && (
                          <span className="text-xs   flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {other.date}
                          </span>
                        )}
                        {category && (
                          <span className="text-[10px]    px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/20">
                            {category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg    group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                        {other.title}
                      </h3>
                      <p className="text-xs text-white/70 line-clamp-3 leading-relaxed mb-6">
                        {other.content}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs   text-purple-300 group-hover:text-white transition-colors">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
