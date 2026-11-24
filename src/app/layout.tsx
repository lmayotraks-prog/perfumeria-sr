// src/app/layout.tsx — SR Essences · Maison de Haute Parfumerie
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { PerfumeStoreProvider } from '@/hooks/usePerfumeStore';

export const metadata: Metadata = {
  title: 'SR Essences | Maison de Haute Parfumerie',
  description:
    'Fragancias de alta perfumería sobre mármol, cristal tallado y polvo de oro. Descubre la colección SR Essences y nuestra enciclopedia olfativa interactiva en 3D.',
  keywords: ['perfumería', 'alta perfumería', 'lujo', 'fragancias', 'SR Essences', 'pirámide olfativa'],
  authors: [{ name: 'SR Essences' }],
  robots: 'index, follow',
  openGraph: {
    title: 'SR Essences | Maison de Haute Parfumerie',
    description: 'Luz líquida y alquimia olfativa en 3D interactivo.',
    type: 'website',
    locale: 'es_ES',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#050504' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="lumiere">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Great+Vibes&family=Montserrat:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <PerfumeStoreProvider>
          {children}
        </PerfumeStoreProvider>
      </body>
    </html>
  );
}
