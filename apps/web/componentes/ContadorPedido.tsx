'use client';

import { useMeuPedido } from '@/lib/carrinho';

/** O número de itens num selinho no canto do botão "Meu pedido", para o cabeçalho não quebrar no celular. */
export function ContadorPedido() {
  const itens = useMeuPedido();
  if (itens.length === 0) return null;
  return (
    <span className="wg-contador num">
      <span aria-hidden="true">{itens.length}</span>
      <span className="wg-sr">, {itens.length === 1 ? '1 item' : `${itens.length} itens`}</span>
    </span>
  );
}
