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
          "/payment-test",
          "/test-supabase",
          "/demo",
          "/preloaders",
          "/hambuger",
          "/textcolor",
          "/firecanvas",
          "/slideup",
          "/style-guide",
          "/features",
          "/work/",
          "/7hrrk",
          "/rrk",
          "/sitemap",
          "/members",
        ],
      },
    ],
    sitemap: "https://7thheavenband.com/sitemap.xml",
  };
}
