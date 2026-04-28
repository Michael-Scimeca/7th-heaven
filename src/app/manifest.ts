import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '7th Heaven Official',
    short_name: '7th Heaven',
    description: 'Official app for 7th Heaven — Chicago\'s Premier Rock Band. Live tour dates, merch, fan feed, and live streams.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050508',
    theme_color: '#851def',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
