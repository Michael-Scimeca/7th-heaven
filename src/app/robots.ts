import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/crew', '/planner', '/studio', '/api/', '/test-supabase', '/demo', '/sitemap', '/members'],
      },
    ],
    sitemap: 'https://7thheavenband.com/sitemap.xml',
  };
}
