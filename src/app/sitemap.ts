import type { MetadataRoute } from 'next';
import { sanityFetch } from '@/sanity/live';
import { queries, SanityTourDate } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://7thheavenband.com';

  // Fetch tour dates for dynamic venue pages
  let tourDates: SanityTourDate[] = [];
  try {
    const { data } = await sanityFetch({ query: queries.allTourDates });
    tourDates = data as SanityTourDate[];
  } catch {}

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    // ── Core Pages ──
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/bio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // ── Tour ──
    {
      url: `${baseUrl}/tour`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tour/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ── Cruise ──
    {
      url: `${baseUrl}/cruise`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cruise/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cruise/cancel`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },

    // ── Booking ──
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book/cancel`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/planner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Live & Community ──
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/fan-photo-wall`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fans`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },

    // ── Store ──
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/merch`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ── Admin (internal, low priority) ──
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/emails`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/admin/email-map`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/crew`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.4,
    },

    // ── Legal ──
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ];

  // Dynamic Tour Date pages (Venue specific)
  const tourDatePages: MetadataRoute.Sitemap = tourDates.map((date: any) => ({
    url: `${baseUrl}/tour/${date.slug?.current || date._id}`,
    lastModified: new Date(date._updatedAt || new Date()),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...tourDatePages];
}
