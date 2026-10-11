import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/live";
import { createClient } from "@supabase/supabase-js";
import showsSupabaseData from "@/data/shows-supabase.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://7thheavenband.com";

  // Fetch shows from Supabase for /shows/[id] pages (with local fallback)
  let showPages: MetadataRoute.Sitemap = [];
  try {
    const { data: shows } = await supabase
      .from("shows")
      .select("id, date")
      .order("date", { ascending: false });

    const showList = shows?.length ? shows : showsSupabaseData;

    if (showList?.length) {
      showPages = showList.map((show: { id: string; date: string }) => ({
        url: `${baseUrl}/shows/${show.id}`,
        lastModified: new Date(show.date + "T12:00:00"),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: [
          `${baseUrl}/images/hero/band-stage.webp`,
          `${baseUrl}/images/hero/band-performance.webp`,
        ],
      }));
    }
  } catch {
    if (showsSupabaseData?.length) {
      showPages = showsSupabaseData.map((show) => ({
        url: `${baseUrl}/shows/${show.id}`,
        lastModified: new Date(show.date + "T12:00:00"),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: [
          `${baseUrl}/images/hero/band-stage.webp`,
          `${baseUrl}/images/hero/band-performance.webp`,
        ],
      }));
    }
  }

  // Fetch news articles from Sanity for /news/[slug] pages
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const { data: articles } = await sanityFetch({
      query: `*[_type == "newsPost"] { "slug": slug.current, publishedAt, _updatedAt, "imageUrl": image.asset->url }`,
    });
    if (Array.isArray(articles) && articles.length) {
      newsPages = articles
        .filter((a: any) => a.slug)
        .map((a: any) => {
          const timestamp = a._updatedAt || a.publishedAt;
          return {
            url: `${baseUrl}/news/${a.slug}`,
            ...(timestamp ? { lastModified: new Date(timestamp) } : {}),
            changeFrequency: "monthly" as const,
            priority: 0.7,
            images: a.imageUrl
              ? [a.imageUrl]
              : [`${baseUrl}/images/hero/band-performance.webp`],
          };
        });
    }
  } catch {}

  // Static public pages (omit lastModified so Google doesn't see fake "today" timestamps)
  const staticPages: MetadataRoute.Sitemap = [
    // ── Core Pages ──
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        `${baseUrl}/images/hero/band-performance.webp`,
        `${baseUrl}/images/hero/band-stage.webp`,
        `${baseUrl}/images/band/band-crowd-panorama.webp`,
      ],
    },
    {
      url: `${baseUrl}/shows/past`,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [
        `${baseUrl}/images/tour/tour-bus.webp`,
        `${baseUrl}/images/hero/band-stage.webp`,
        `${baseUrl}/images/hero/band-performance.webp`,
      ],
    },
    {
      url: `${baseUrl}/cruise`,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [
        `${baseUrl}/images/cruise/at-sea.png`,
        `${baseUrl}/images/cruise/cruise-hero.png`,
        `${baseUrl}/images/cruise/deck.png`,
        `${baseUrl}/images/cruise/cococay-beach-party.png`,
      ],
    },
    {
      url: `${baseUrl}/book`,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [
        `${baseUrl}/images/hero/band-performance.webp`,
        `${baseUrl}/images/events/corporate.jpg`,
        `${baseUrl}/images/events/festival.jpg`,
        `${baseUrl}/images/events/wedding.jpg`,
      ],
    },
    {
      url: `${baseUrl}/merch`,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [
        `${baseUrl}/images/merch/logo-tee.png`,
        `${baseUrl}/images/merch/hoodie.png`,
        `${baseUrl}/images/merch/vinyl.png`,
        `${baseUrl}/images/merch/merch-be-here.png`,
      ],
    },
    {
      url: `${baseUrl}/media`,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [
        `${baseUrl}/images/hero/band-performance.webp`,
        `${baseUrl}/images/album/luminous.png`,
      ],
    },
    {
      url: `${baseUrl}/live`,
      changeFrequency: "weekly",
      priority: 0.7,
      images: [
        `${baseUrl}/images/hero/band-stage.webp`,
        `${baseUrl}/images/hero/band-performance.webp`,
      ],
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [
        `${baseUrl}/images/contact/alan-contact.png`,
        `${baseUrl}/images/contact/lenny-contact.png`,
      ],
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rock-and-roll-kids`,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [
        `${baseUrl}/images/7hrrk/artbook.jpg`,
        `${baseUrl}/images/7hrrk/book1.jpg`,
        `${baseUrl}/images/7hrrk/All-c.png`,
      ],
    },

    // ── Community & Fan Media ──
    {
      url: `${baseUrl}/fans`,
      changeFrequency: "daily",
      priority: 0.6,
      images: [
        `${baseUrl}/images/fans/fan-photo-featured.jpg`,
        `${baseUrl}/images/hero/band-performance.webp`,
      ],
    },
    {
      url: `${baseUrl}/fan-media-wall`,
      changeFrequency: "weekly",
      priority: 0.6,
      images: [
        `${baseUrl}/images/fans/fan-photo-featured.jpg`,
        `${baseUrl}/images/hero/band-performance.webp`,
      ],
    },

    // ── Legal & Policies ──
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/returns`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  return [...staticPages, ...showPages, ...newsPages];
}


