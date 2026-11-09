import type { MetadataRoute } from 'next';
import { MODO_DEMO, URL_SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  if (MODO_DEMO) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/painel', '/api', '/pedido', '/meu-pedido'] }], sitemap: `${URL_SITE}/sitemap.xml` };
}
