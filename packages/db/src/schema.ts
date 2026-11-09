import { boolean, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

// Os valores dos enums repetem os de @webgado/core (pedido.ts). Se mudar lá, mude aqui e gere a migração.
export const categoriaEnum = pgEnum('categoria', ['embriao', 'novilha', 'vaca', 'touro', 'semen']);
export const disponibilidadeEnum = pgEnum('disponibilidade', ['disponivel', 'poucas_unidades', 'sob_encomenda', 'indisponivel']);
export const statusPrecoEnum = pgEnum('status_preco', ['aprovado', 'proposta']);
export const conservacaoEnum = pgEnum('conservacao', ['fresco', 'congelado', 'ambos']);
export const papelAnimalEnum = pgEnum('papel_animal', ['doadora', 'touro']);
export const canalEnum = pgEnum('canal', ['whatsapp', 'online']);
export const statusPedidoEnum = pgEnum('status_pedido', [
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
]);

const quando = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** Hoje só a Girolando Passos. A tabela existe para o Web Gado poder virar marketplace sem refazer nada. */
export const vendedores = pgTable('vendedores', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  slug: text().notNull().unique(),
  whatsappE164: text().notNull(),
  cidade: text().notNull(),
  uf: text().notNull(),
  documento: text(),
  instagram: text(),
  ativo: boolean().notNull().default(true),
  criadoEm: quando(),
});

export const animais = pgTable('animais', {
  id: uuid().primaryKey().defaultRandom(),
  vendedorId: uuid().notNull().references(() => vendedores.id),
  nome: text().notNull(),
  papel: papelAnimalEnum().notNull(),
  raca: text().notNull(),
  grauSangue: text(),
  registroAbcg: text(),
  producaoLeiteKgDia: real(),
  observacoes: text(),
  criadoEm: quando(),
});

export const tipos = pgTable(
  'tipos',
  {
    id: uuid().primaryKey().defaultRandom(),
    vendedorId: uuid().notNull().references(() => vendedores.id),
    categoria: categoriaEnum().notNull().default('embriao'),
    codigo: text().notNull(),
    slug: text().notNull().unique(),
    nome: text().notNull(),
    resumo: text().notNull(),
    descricao: text(),
    grauSangue: text(),
    sexado: boolean(),
    sexo: text(),
    conservacao: conservacaoEnum(),
    maeId: uuid().references(() => animais.id),
    paiId: uuid().references(() => animais.id),
    maeDescricao: text(),
    paiDescricao: text(),
    disponibilidade: disponibilidadeEnum().notNull().default('disponivel'),
    prazoEntregaDias: integer(),
    oQueInclui: text(),
    videoUrl: text(),
    ordem: integer().notNull().default(0),
    publicado: boolean().notNull().default(true),
    statusPreco: statusPrecoEnum().notNull().default('proposta'),
    atualizadoEm: quando(),
  },
  (t) => [uniqueIndex('tipos_vendedor_codigo').on(t.vendedorId, t.codigo)],
);

export const midias = pgTable('midias', {
  id: uuid().primaryKey().defaultRandom(),
  tipoId: uuid().references(() => tipos.id, { onDelete: 'cascade' }),
  animalId: uuid().references(() => animais.id, { onDelete: 'cascade' }),
  tipo: text().notNull().default('foto'),
  url: text().notNull(),
  alt: text().notNull(),
  largura: integer(),
  altura: integer(),
  ordem: integer().notNull().default(0),
  credito: text(),
});

export const pacotes = pgTable(
  'pacotes',
  {
    id: uuid().primaryKey().defaultRandom(),
    tipoId: uuid()
      .notNull()
      .references(() => tipos.id, { onDelete: 'cascade' }),
    quantidade: integer().notNull(),
    precoTotalCentavos: integer().notNull(),
    ativo: boolean().notNull().default(true),
    ordem: integer().notNull().default(0),
  },
  (t) => [uniqueIndex('pacotes_tipo_quantidade').on(t.tipoId, t.quantidade)],
);

export const historicoPrecos = pgTable('historico_precos', {
  id: uuid().primaryKey().defaultRandom(),
  pacoteId: uuid()
    .notNull()
    .references(() => pacotes.id, { onDelete: 'cascade' }),
  precoAntes: integer().notNull(),
  precoDepois: integer().notNull(),
  porUsuario: text().notNull(),
  em: quando(),
});

export const clientes = pgTable('clientes', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  whatsappE164: text().notNull().unique(),
  documento: text(),
  tipoPessoa: text(),
  cidade: text().notNull(),
  uf: text().notNull(),
  propriedade: text(),
  email: text(),
  aceitaOfertas: boolean().notNull().default(false),
  consentimentoEm: timestamp({ withTimezone: true }),
  origem: jsonb(),
  criadoEm: quando(),
  atualizadoEm: quando(),
});

export const pedidos = pgTable(
  'pedidos',
  {
    id: uuid().primaryKey().defaultRandom(),
    numero: integer().notNull().unique().generatedAlwaysAsIdentity({ startWith: 1001 }),
    token: text().notNull().unique(),
    vendedorId: uuid().notNull().references(() => vendedores.id),
    clienteId: uuid().notNull().references(() => clientes.id),
    canal: canalEnum().notNull(),
    status: statusPedidoEnum().notNull(),
    totalCentavos: integer().notNull(),
    observacao: text(),
    origem: jsonb(),
    criadoEm: quando(),
    atualizadoEm: quando(),
  },
  (t) => [index('pedidos_status').on(t.status), index('pedidos_criado_em').on(t.criadoEm)],
);

export const itensPedido = pgTable('itens_pedido', {
  id: uuid().primaryKey().defaultRandom(),
  pedidoId: uuid()
    .notNull()
    .references(() => pedidos.id, { onDelete: 'cascade' }),
  tipoId: uuid()
    .notNull()
    .references(() => tipos.id),
  pacoteId: uuid().references(() => pacotes.id),
  codigoTipo: text().notNull(),
  quantidadeEmbrioes: integer().notNull(),
  precoTotalCentavos: integer().notNull(),
  descricao: text().notNull(),
});

/** Fase 3 (Mercado Pago). Já existe para o modelo ficar completo. */
export const pagamentos = pgTable('pagamentos', {
  id: uuid().primaryKey().defaultRandom(),
  pedidoId: uuid()
    .notNull()
    .references(() => pedidos.id, { onDelete: 'cascade' }),
  metodo: text().notNull(),
  mpPaymentId: text().unique(),
  status: text().notNull(),
  valorCentavos: integer().notNull(),
  parcelas: integer(),
  pixCopiaCola: text(),
  pixQr: text(),
  expiraEm: timestamp({ withTimezone: true }),
  motivoRecusa: text(),
  payload: jsonb(),
  criadoEm: quando(),
});

export const eventosPedido = pgTable('eventos_pedido', {
  id: uuid().primaryKey().defaultRandom(),
  pedidoId: uuid()
    .notNull()
    .references(() => pedidos.id, { onDelete: 'cascade' }),
  deStatus: statusPedidoEnum(),
  paraStatus: statusPedidoEnum().notNull(),
  por: text().notNull(),
  nota: text(),
  em: quando(),
});

/** Fase 4 (Cloud API da Meta). */
export const mensagensWhatsapp = pgTable('mensagens_whatsapp', {
  id: uuid().primaryKey().defaultRandom(),
  pedidoId: uuid().references(() => pedidos.id, { onDelete: 'set null' }),
  clienteId: uuid().references(() => clientes.id, { onDelete: 'set null' }),
  direcao: text().notNull(),
  template: text(),
  wamid: text(),
  statusEnvio: text().notNull(),
  erro: text(),
  em: quando(),
});

export const webhooksRecebidos = pgTable('webhooks_recebidos', {
  id: uuid().primaryKey().defaultRandom(),
  origem: text().notNull(),
  eventoId: text().notNull().unique(),
  payload: jsonb().notNull(),
  processadoEm: timestamp({ withTimezone: true }),
  recebidoEm: quando(),
});

export const configuracoes = pgTable('configuracoes', {
  chave: text().primaryKey(),
  valor: jsonb().notNull(),
  atualizadoEm: quando(),
});
