/** Status do pedido, os rótulos que cada pessoa vê e as mudanças permitidas. */

export const STATUS_PEDIDO = [
  'em_conversa',
  'aguardando_pagamento',
  'pagamento_recusado',
  'expirado',
  'pago',
  'em_preparacao',
  'envio_agendado',
  'entregue',
  'concluido',
  'perdido',
  'cancelado',
  'reembolsado',
] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const CANAIS = ['whatsapp', 'online'] as const;
export type Canal = (typeof CANAIS)[number];

/** Como o Filipe lê o status no painel. */
export const ROTULO_STATUS: Record<StatusPedido, string> = {
  em_conversa: 'Em conversa',
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_recusado: 'Pagamento recusado',
  expirado: 'Pix vencido',
  pago: 'Pago',
  em_preparacao: 'Em preparação',
  envio_agendado: 'Envio agendado',
  entregue: 'Entregue',
  concluido: 'Concluído',
  perdido: 'Não fechou',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  em_conversa: ['aguardando_pagamento', 'pago', 'perdido', 'cancelado'],
  aguardando_pagamento: ['pago', 'pagamento_recusado', 'expirado', 'cancelado', 'perdido'],
  pagamento_recusado: ['aguardando_pagamento', 'pago', 'cancelado', 'perdido'],
  expirado: ['aguardando_pagamento', 'pago', 'cancelado', 'perdido'],
  pago: ['em_preparacao', 'cancelado'],
  em_preparacao: ['envio_agendado', 'cancelado'],
  envio_agendado: ['entregue', 'cancelado'],
  entregue: ['concluido'],
  concluido: [],
  perdido: ['em_conversa'],
  cancelado: ['reembolsado'],
  reembolsado: [],
};

export function proximosStatus(atual: StatusPedido): StatusPedido[] {
  return TRANSICOES[atual];
}

export function podeMudar(de: StatusPedido, para: StatusPedido): boolean {
  return TRANSICOES[de].includes(para);
}

/** As etapas que o comprador vê na linha do tempo. */
export const ETAPAS_CLIENTE = ['pago', 'em_preparacao', 'envio_agendado', 'entregue', 'concluido'] as const;
export type EtapaCliente = (typeof ETAPAS_CLIENTE)[number];

export const ROTULO_ETAPA: Record<EtapaCliente, string> = {
  pago: 'Pago',
  em_preparacao: 'Em preparação',
  envio_agendado: 'Envio agendado',
  entregue: 'Entregue',
  concluido: 'Concluído',
};

export type EstadoEtapa = 'feito' | 'atual' | 'porvir';

/** Para cada etapa do comprador, se já foi feita, é a atual ou ainda vem. Status antes do pagamento deixam tudo por vir. */
export function linhaDoTempo(status: StatusPedido): { etapa: EtapaCliente; estado: EstadoEtapa }[] {
  const indice = (ETAPAS_CLIENTE as readonly string[]).indexOf(status);
  return ETAPAS_CLIENTE.map((etapa, i) => ({
    etapa,
    estado: indice < 0 ? 'porvir' : i < indice ? 'feito' : i === indice ? (status === 'concluido' ? 'feito' : 'atual') : 'porvir',
  }));
}

export const DISPONIBILIDADES = ['disponivel', 'poucas_unidades', 'sob_encomenda', 'indisponivel'] as const;
export type Disponibilidade = (typeof DISPONIBILIDADES)[number];

export const ROTULO_DISPONIBILIDADE: Record<Disponibilidade, string> = {
  disponivel: 'Disponível',
  poucas_unidades: 'Poucas unidades',
  sob_encomenda: 'Sob encomenda',
  indisponivel: 'Indisponível',
};
