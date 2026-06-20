import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Task Calendar Personalizat',
    short_name: 'Calendar',
    description: 'Taskurile tale, pe orice dispozitiv',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
