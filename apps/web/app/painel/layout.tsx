import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s · Painel do Web Gado' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-fundo">{children}</div>;
}
