import { defineLive } from "next-sanity/live";
import { sanityClient } from "@/lib/sanity";

// defineLive enables real-time content updates from Sanity Studio.
// When content is edited in the Studio, the frontend updates instantly.
export const { sanityFetch, SanityLive } = defineLive({
 client: sanityClient,
 // Server token for fetching draft content (optional — for preview mode)
 serverToken: process.env.SANITY_API_TOKEN,
 // Browser token for real-time subscriptions (optional — for live updates)
 browserToken: process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN,
});
