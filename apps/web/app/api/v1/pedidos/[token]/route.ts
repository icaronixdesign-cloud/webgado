import { ROTULO_ETAPA, ROTULO_STATUS, linhaDoTempo, mascararTelefone } from '@webgado/core';
import { obterPedidoPorToken } from '@webgado/db';
import { falha, ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Situação do pedido para o comprador (o app usa esta rota). Só com o token do pedido; sem CPF nem e-mail. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = token.length >= 20 ? await obterPedidoPorToken(token) : null;
  if (!p) return falha(404, 'nao_encontrado', 'Pedido não encontrado.');
  return ok({
    numero: p.numero,
    canal: p.canal,
    status: p.status,
    statusRotulo: ROTULO_STATUS[p.status],
    totalCentavos: p.totalCentavos,
    itens: p.itens,
    cliente: { nome: p.cliente.nome, whatsapp: mascararTelefone(p.cliente.whatsappE164), cidade: p.cliente.cidade, uf: p.cliente.uf },
    linhaDoTempo: linhaDoTempo(p.status).map((e) => ({ ...e, rotulo: ROTULO_ETAPA[e.etapa] })),
    criadoEm: p.criadoEm.toISOString(),
  });
}
