import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/crew",
          "/crew-*",
          "/planner",
          "/studio",
          "/api/",
          "/payment",
          "/payment-test",
          "/test-supabase",
          "/demo",
          "/preloaders",
          "/hambuger",
          "/textcolor",
          "/firecanvas",
          "/slideup",
          "/style-guide",
          "/blur-fade-test",
          "/work/",
          "/7hrrk",
          "/rrk",
          "/sitemap",
          "/members",
          "/band-preview",
          "/tabs-preview",
          "/threeslider",
          "/masonry-demo",
          "/dropdown-preview",
          "/media-filter-preview",
          "/transition-test",
          "/cruise/preview",
          "/push-updates",
          "/qr",
        ],
      },
    ],
    sitemap: "https://7thheavenband.com/sitemap.xml",
  };
}
