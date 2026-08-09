import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

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
 token: typeof window === 'undefined' ? process.env.SANITY_API_TOKEN : undefined, // Server-side only — never expose
});

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

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
 doorsTime?: string;
 playTime?: string;
 allAges?: boolean;
 cover?: string;
 ticketLink?: string;
 directionsLink?: string;
 mapUrl?: string;
 parkingInfo?: string;
 parkingUrl?: string;
 websiteUrl?: string;
 isSoldOut: boolean;
 isFestival: boolean;
 isPrivate?: boolean;
 tags: string[];
 notes?: string;
 lat?: number;
 lng?: number;
}

export interface SanityBandMember {
 _id: string;
 _type: "bandMember";
 name: string;
 slug: { current: string };
 role: string;
 image?: SanityImageSource;
 birthday?: string;
 zodiac?: string;
 favQuote?: string;
 bestTrait?: string;
 worstTrait?: string;
 favBands?: string;
 favAlbum?: string;
 favMovie?: string;
 fav7hSong?: string;
 firstSong?: string;
 bestFeeling?: string;
 hobbies?: string;
 influences?: string;
 funFact?: string;
 order: number;
}

export interface SanityVideo {
 _id: string;
 _type: "video";
 title: string;
 youtubeId: string;
 category: string;
 year?: number;
 duration?: string;
 description?: string;
 viewCount?: string;
}

export interface SanitySiteSettings {
 _id: string;
 _type: "siteSettings";
 bandName: string;
 tagline: string;
 subTagline: string;
 announcement?: {
  isActive: boolean;
  text: string;
  link?: string;
  linkText?: string;
  expiresAt?: string;
 };
 bioIntro: string;
 bioIntro2: string;
 stats: { number: string; label: string }[];
 latestRelease: {
  title: string;
  year: string;
  duration: string;
  type: string;
  description: string;
  youtubeId: string;
  buyLink: string;
  spotifyLink: string;
  appleMusicLink: string;
  credits: { role: string; name: string }[];
  behindTheScenes: SanityImageSource[];
 };
 socialLinks: { name: string; url: string }[];
 platformLinks: { name: string; url: string; label: string }[];
 endorsements: { name: string; logo?: SanityImageSource; logoPath?: string }[];
 contacts: {
  category: string;
  company?: string;
  name?: string;
  email: string;
  phone: string;
  note?: string;
 }[];
 bookingPhone: string;
 bookingEmail: string;
 accomplishments: string[];
 performedWith: string[];
 btsVideos: {
  youtubeId: string;
  title: string;
  subtitle: string;
  director: string;
  year: number;
 }[];
 navLinks: { href: string; label: string }[];
}

// ─── GROQ Queries ───
export const queries = {
 // News
 allNews: `*[_type == "newsPost"] | order(publishedAt desc) { _id, title, slug, content, date, category, image, featured, publishedAt }`,
 featuredNews: `*[_type == "newsPost" && featured == true] | order(publishedAt desc)[0...3] { _id, title, slug, content, date, category, image, featured, publishedAt }`,

 // Tour Dates
 allTourDates: `*[_type == "tourDate"] | order(date asc) { _id, venue, city, state, date, time, playTime, day, doorsTime, allAges, cover, ticketLink, directionsLink, isSoldOut, isFestival, isPrivate, tags, notes, lat, lng }`,
 upcomingTourDates: `*[_type == "tourDate" && date >= now()] | order(date asc) { _id, venue, city, state, date, time, playTime, day, doorsTime, allAges, cover, ticketLink, directionsLink, isSoldOut, isFestival, isPrivate, tags, notes, lat, lng }`,

 // Band Members
 allBandMembers: `*[_type == "bandMember"] | order(order asc) { _id, name, slug, role, image, birthday, zodiac, favQuote, bestTrait, worstTrait, favBands, favAlbum, favMovie, fav7hSong, firstSong, bestFeeling, hobbies, influences, funFact, order }`,
 // Returns { query, params } — pass both to sanityClient.fetch() or fetchSanity()
 memberBySlug: (slug: string) => ({
  query: `*[_type == "bandMember" && slug.current == $slug][0] { _id, name, slug, role, image, birthday, zodiac, favQuote, bestTrait, worstTrait, favBands, favAlbum, favMovie, fav7hSong, firstSong, bestFeeling, hobbies, influences, funFact }`,
  params: { slug },
 }),

 // Videos
 allVideos: `*[_type == "video"] | order(category asc, year desc) { _id, title, youtubeId, category, year, duration, description, viewCount }`,
 // Returns { query, params } — pass both to sanityClient.fetch() or fetchSanity()
 videosByCategory: (category: string) => ({
  query: `*[_type == "video" && category == $category] | order(year desc) { _id, title, youtubeId, category, year, duration, description, viewCount }`,
  params: { category },
 }),

 // Site Settings (singleton)
 siteSettings: `*[_type == "siteSettings"][0]`,
};

// ─── Fetch helpers ───
export async function fetchSanity<T>(query: string, params?: Record<string, unknown>): Promise<T> {
 return sanityClient.fetch<T>(query, params || {});
}

/**
 * Fetch a single band member by slug.
 * Uses GROQ $param syntax — the slug value is never interpolated into the query string.
 */
export async function fetchMemberBySlug(slug: string): Promise<SanityBandMember | null> {
 const { query, params } = queries.memberBySlug(slug);
 return sanityClient.fetch<SanityBandMember | null>(query, params);
}

/**
 * Fetch all videos in a given category.
 * Uses GROQ $param syntax — the category value is never interpolated into the query string.
 */
export async function fetchVideosByCategory(category: string): Promise<SanityVideo[]> {
 const { query, params } = queries.videosByCategory(category);
 return sanityClient.fetch<SanityVideo[]>(query, params);
}
