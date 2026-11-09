/** Configurações do site que não vêm do banco. */

/** Demo para o Filipe: fora do Google e sem pagamento online (fase 2a). */
export const MODO_DEMO = process.env.WEBGADO_DEMO !== '0';

/** Pix e cartão entram na fase 3. Até lá, a compra fecha pelo WhatsApp. */
export const PAGAMENTO_ONLINE = process.env.WEBGADO_PAGAMENTO_ONLINE === '1';

export const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
