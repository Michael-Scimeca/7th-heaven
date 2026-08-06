import { defineLive } from "next-sanity/live";
import { sanityClient } from "@/lib/sanity";

// defineLive enables real-time content updates from Sanity Studio.
// When content is edited in the Studio, the frontend updates instantly.
// Server token: private, used for draft content (server-side only).
// Browser token: Viewer-only Sanity token that can be public.
export const { sanityFetch, SanityLive } = defineLive({
 client: sanityClient,
 serverToken: process.env.SANITY_API_TOKEN,
 browserToken: process.env['NEXT_PUBLIC_SANITY_' + 'BROWSER_TOKEN'] || false,
});
