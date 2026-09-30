import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "7th Heaven",
    short_name: "7th Heaven",
    description:
      "Official app for 7th Heaven — Chicago's Premier Rock Band. Live tour dates, merch, fan feed, and live streams.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    orientation: "portrait",
    categories: ["music", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Tour dates",
        short_name: "Tour",
        description: "View upcoming tour dates and live schedule",
        url: "/#tour",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Watch live",
        short_name: "Live",
        description: "Watch live feeds and concert streams",
        url: "/live",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Merch",
        short_name: "Merch",
        description: "Official 7th Heaven merchandise store",
        url: "/merch",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
