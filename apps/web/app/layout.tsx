import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible_Next, Marcellus } from 'next/font/google';
import { MODO_DEMO, URL_SITE } from '@/lib/site';
import './globals.css';

const marcellus = Marcellus({ weight: '400', subsets: ['latin'], variable: '--fonte-marcellus', display: 'swap' });
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ['latin'], variable: '--fonte-atkinson', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: {
    default: 'Embriões Girolando da Girolando Passos · Web Gado',
    template: '%s · Web Gado',
  },
  description:
    'Embriões Girolando da Girolando Passos, de Passos (MG), em pacotes de 12 a 48 com preço fechado. Escolha o tipo, escolha o pacote e feche com o Filipe no WhatsApp.',
  applicationName: 'Web Gado',
  robots: MODO_DEMO ? { index: false, follow: false } : undefined,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Web Gado',
    images: [{ url: '/fotos/bezerras-pasto.jpg', width: 361, height: 300, alt: 'Bezerras Gir no pasto da Girolando Passos' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${marcellus.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
