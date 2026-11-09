import type { NextConfig } from 'next';

const demo = process.env.WEBGADO_DEMO !== '0';

const config: NextConfig = {
  transpilePackages: ['@webgado/core', '@webgado/db', '@webgado/tokens'],
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];
    // A demo fica fora do Google até o Filipe aprovar e as fotos definitivas chegarem.
    if (demo) base.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
    return [{ source: '/:caminho*', headers: base }];
  },
};

export default config;
