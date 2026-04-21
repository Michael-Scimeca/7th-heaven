import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1dg5ciuj";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// Read-only client for fetching data on the frontend
export const sanityClient = createClient({
 projectId,
 dataset,
 apiVersion,
 useCdn: true, // CDN for fast reads on published content
 stega: { studioUrl: "/studio" }, // Enable visual editing overlays
});

// Write client for mutations (server-side only)
export const sanityWriteClient = createClient({
 projectId,
 dataset,
 apiVersion,
 useCdn: false,
 token: process.env.SANITY_API_TOKEN, // Server-side only — never expose
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
 return builder.image(source);
}

// ─── Types ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

export interface SanityNewsPost {
 _id: string;
 _type: "newsPost";
 title: string;
 slug: { current: string };
 content: string;
 date: string;
 category: "announcement" | "update" | "press" | "release";
 image?: SanityImageSource;
 featured: boolean;
 publishedAt: string;
}

export interface SanityTourDate {
 _id: string;
 _type: "tourDate";
 venue: string;
 city: string;
 state: string;
 date: string;
 time: string;
 day: string;
 ticketLink?: string;
 directionsLink?: string;
 isSoldOut: boolean;
 isFestival: boolean;
 tags: string[];
 notes?: string;
}

export interface SanityBandMember {
 _id: string;
 _type: "bandMember";
 name: string;
 slug: { current: string };
 role: string;
 image?: SanityImageSource;
 bio: string;
 qaPairs: { question: string; answer: string }[];
 instruments: string[];
 order: number;
}

// ─── GROQ Queries ───
export const queries = {
 // News
 allNews: `*[_type == "newsPost"] | order(publishedAt desc) { _id, title, slug, content, date, category, image, featured, publishedAt }`,
 featuredNews: `*[_type == "newsPost" && featured == true] | order(publishedAt desc)[0...3] { _id, title, slug, content, date, category, image, featured, publishedAt }`,

 // Tour Dates
 allTourDates: `*[_type == "tourDate"] | order(date asc) { _id, venue, city, state, date, time, day, ticketLink, directionsLink, isSoldOut, isFestival, tags, notes }`,
 upcomingTourDates: `*[_type == "tourDate" && date >= now()] | order(date asc) { _id, venue, city, state, date, time, day, ticketLink, directionsLink, isSoldOut, isFestival, tags, notes }`,

 // Band Members
 allBandMembers: `*[_type == "bandMember"] | order(order asc) { _id, name, slug, role, image, bio, qaPairs, instruments, order }`,
 memberBySlug: (slug: string) =>
  `*[_type == "bandMember" && slug.current == "${slug}"][0] { _id, name, slug, role, image, bio, qaPairs, instruments }`,
};

// ─── Fetch helpers ───
export async function fetchSanity<T>(query: string, params?: Record<string, unknown>): Promise<T> {
 return sanityClient.fetch<T>(query, params || {});
}
