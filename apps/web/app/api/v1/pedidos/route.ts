import { errosPorCampo, linkWhatsApp, mensagemPedido, pedidoEntradaEsquema } from '@webgado/core';
import { ErroPedido, criarPedido } from '@webgado/db';
import { dentroDoLimite, falha, ipDe, ok } from '@/lib/api';
import { PAGAMENTO_ONLINE } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** Cria um pedido. Caminho WhatsApp: grava "em conversa" e devolve a mensagem pronta e o link wa.me. */
export async function POST(req: Request) {
  if (!dentroDoLimite(`pedido:${ipDe(req)}`, 10, 10 * 60_000)) {
    return falha(429, 'muitas_tentativas', 'Muitos pedidos seguidos. Espere alguns minutos ou fale com o Filipe no WhatsApp.');
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return falha(400, 'corpo_invalido', 'O pedido chegou incompleto. Tente de novo.');
  }

  const r = pedidoEntradaEsquema.safeParse(corpo);
  if (!r.success) return falha(422, 'dados_invalidos', 'Confira os campos marcados.', errosPorCampo(r.error));
  if (r.data.canal === 'online' && !PAGAMENTO_ONLINE) {
    return falha(409, 'pagamento_indisponivel', 'O pagamento pelo site ainda não está ligado. Envie o pedido pelo WhatsApp.');
  }

  try {
    const pedido = await criarPedido(r.data, { origem: 'site' });
    const mensagem = mensagemPedido({ numero: pedido.numero, itens: pedido.itens, ...pedido.cliente });
    return ok(
      {
        numero: pedido.numero,
        token: pedido.token,
        totalCentavos: pedido.totalCentavos,
        status: r.data.canal === 'whatsapp' ? 'em_conversa' : 'aguardando_pagamento',
        mensagem,
        whatsappUrl: linkWhatsApp(pedido.vendedorWhatsapp, mensagem),
      },
      201,
    );
  } catch (e) {
    if (e instanceof ErroPedido) return falha(409, e.codigo, e.message);
    console.error('Falha ao criar pedido', e);
    return falha(500, 'erro_interno', 'Não deu para gravar o pedido agora. Tente de novo ou fale com o Filipe no WhatsApp.');
  }
}
