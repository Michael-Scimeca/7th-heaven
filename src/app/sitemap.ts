import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://7thheavenband.com";

  // Fetch tour dates for dynamic venue pages
  let tourDates: SanityTourDate[] = [];
  try {
    const { data } = await sanityFetch({ query: queries.allTourDates });
    tourDates = data as SanityTourDate[];
  } catch {}

  // Fetch shows from Supabase for /shows/[id] pages
  let showPages: MetadataRoute.Sitemap = [];
  try {
    const { data: shows } = await supabase
      .from("shows")
      .select("id, date")
      .order("date", { ascending: false });
    if (shows?.length) {
      showPages = shows.map((show) => ({
        url: `${baseUrl}/shows/${show.id}`,
        lastModified: new Date(show.date + "T12:00:00"),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  // Fetch news articles from Sanity for /news/[slug] pages
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const { data: articles } = await sanityFetch({
      query: `*[_type == "newsPost"] { "slug": slug.current, publishedAt, _updatedAt }`,
    });
    if (Array.isArray(articles) && articles.length) {
      newsPages = articles
        .filter((a: any) => a.slug)
        .map((a: any) => ({
          url: `${baseUrl}/news/${a.slug}`,
          lastModified: new Date(a._updatedAt || a.publishedAt || new Date()),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
    }
  } catch {}

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    // ── Core Pages ──
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shows/past`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cruise`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/merch`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rock-and-roll-kids`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // ── Community & Fan Media ──
    {
      url: `${baseUrl}/fans`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fan-photo-wall`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fan-media-wall`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // ── Legal & Policies ──
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Dynamic Tour Date pages (Venue specific)
  const tourDatePages: MetadataRoute.Sitemap = tourDates.map((date: any) => ({
    url: `${baseUrl}/tour/${date.slug?.current || date._id}`,
    lastModified: new Date(date._updatedAt || new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...tourDatePages, ...showPages, ...newsPages];
}

