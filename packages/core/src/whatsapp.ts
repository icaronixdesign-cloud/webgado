import { formatarReais } from './dinheiro';
import { apenasDigitos } from './documentos';

export interface ItemMensagem {
  codigo: string;
  quantidade: number;
  precoTotalCentavos: number;
}

export interface DadosMensagemPedido {
  numero: number;
  itens: ItemMensagem[];
  nome: string;
  cidade: string;
  uf: string;
}

/** A mensagem que o comprador manda para o Filipe, no texto do briefing. */
export function mensagemPedido({ numero, itens, nome, cidade, uf }: DadosMensagemPedido): string {
  const partes = itens.map((i) => `Tipo ${i.codigo}, pacote de ${i.quantidade} embriões — ${formatarReais(i.precoTotalCentavos)}`);
  const total = itens.reduce((s, i) => s + i.precoTotalCentavos, 0);
  const lista = partes.length === 1 ? partes[0] : `${partes.join('; ')}. Total: ${formatarReais(total)}`;
  return `Olá, Filipe! Vim pelo Web Gado e quero fechar este pedido: Pedido nº ${numero} — ${lista}. Meu nome é ${nome.trim()}, de ${cidade.trim()}/${uf}.`;
}

/** A mensagem do botão de dúvida, com o contexto da tela. */
export function mensagemDuvida(codigoTipo?: string): string {
  return codigoTipo
    ? `Olá, Filipe! Vim pelo Web Gado e tenho uma dúvida sobre o embrião Tipo ${codigoTipo}.`
    : 'Olá, Filipe! Vim pelo Web Gado e tenho uma dúvida.';
}

/** Link wa.me com o texto pronto. Quem envia é o comprador. */
export function linkWhatsApp(numeroE164: string, texto: string): string {
  return `https://wa.me/${apenasDigitos(numeroE164)}?text=${encodeURIComponent(texto)}`;
}
