import { randomBytes } from 'node:crypto';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { podeMudar, type PedidoEntrada, type StatusPedido } from '@webgado/core';
import { banco } from './cliente';
import { clientes, eventosPedido, itensPedido, pacotes, pedidos, tipos, vendedores } from './schema';

export class ErroPedido extends Error {
  constructor(
    message: string,
    readonly codigo: 'item_invalido' | 'tipo_indisponivel' | 'status_invalido' | 'nao_encontrado',
  ) {
    super(message);
  }
}

export interface ItemCriado {
  codigo: string;
  nome: string;
  quantidade: number;
  precoTotalCentavos: number;
}

export interface PedidoCriado {
  numero: number;
  token: string;
  totalCentavos: number;
  itens: ItemCriado[];
  cliente: { nome: string; cidade: string; uf: string; whatsappE164: string };
  vendedorWhatsapp: string;
}

/** Grava o pedido com o preço do banco (nunca o que veio da tela) e o primeiro evento da linha do tempo. */
export async function criarPedido(entrada: PedidoEntrada, origem?: Record<string, string>): Promise<PedidoCriado> {
  const db = await banco();
  return db.transaction(async (tx) => {
    const [vendedor] = await tx.select().from(vendedores).where(eq(vendedores.ativo, true)).limit(1);
    if (!vendedor) throw new ErroPedido('Nenhum vendedor ativo.', 'nao_encontrado');

    const codigos = [...new Set(entrada.itens.map((i) => i.tipo))];
    const listaTipos = await tx.select().from(tipos).where(and(eq(tipos.vendedorId, vendedor.id), inArray(tipos.codigo, codigos)));
    const listaPacotes = listaTipos.length
      ? await tx.select().from(pacotes).where(inArray(pacotes.tipoId, listaTipos.map((t) => t.id)))
      : [];

    const itens = entrada.itens.map((item) => {
      const tipo = listaTipos.find((t) => t.codigo === item.tipo);
      if (!tipo || !tipo.publicado) throw new ErroPedido(`O tipo ${item.tipo} não está à venda.`, 'item_invalido');
      if (tipo.disponibilidade === 'indisponivel') throw new ErroPedido(`O tipo ${item.tipo} está indisponível no momento.`, 'tipo_indisponivel');
      const pacote = listaPacotes.find((p) => p.tipoId === tipo.id && p.quantidade === item.quantidade && p.ativo);
      if (!pacote) throw new ErroPedido(`Não existe pacote de ${item.quantidade} embriões no tipo ${item.tipo}.`, 'item_invalido');
      return { tipo, pacote };
    });

    const c = entrada.cliente;
    const agora = new Date();
    const [cliente] = await tx
      .insert(clientes)
      .values({
        nome: c.nome,
        whatsappE164: c.whatsapp,
        documento: c.documento || null,
        tipoPessoa: c.documento ? (c.documento.length === 14 ? 'juridica' : 'fisica') : null,
        cidade: c.cidade,
        uf: c.uf,
        propriedade: c.propriedade || null,
        email: c.email || null,
        aceitaOfertas: c.aceitaOfertas,
        consentimentoEm: c.aceitaOfertas ? agora : null,
        origem: origem ?? null,
      })
      .onConflictDoUpdate({
        target: clientes.whatsappE164,
        set: {
          nome: c.nome,
          cidade: c.cidade,
          uf: c.uf,
          ...(c.documento ? { documento: c.documento, tipoPessoa: c.documento.length === 14 ? 'juridica' : 'fisica' } : {}),
          ...(c.propriedade ? { propriedade: c.propriedade } : {}),
          ...(c.email ? { email: c.email } : {}),
          ...(c.aceitaOfertas ? { aceitaOfertas: true, consentimentoEm: agora } : {}),
          atualizadoEm: agora,
        },
      })
      .returning();
    if (!cliente) throw new ErroPedido('Não foi possível salvar seus dados.', 'item_invalido');

    const total = itens.reduce((s, i) => s + i.pacote.precoTotalCentavos, 0);
    const status: StatusPedido = entrada.canal === 'whatsapp' ? 'em_conversa' : 'aguardando_pagamento';
    const [pedido] = await tx
      .insert(pedidos)
      .values({
        token: randomBytes(18).toString('base64url'),
        vendedorId: vendedor.id,
        clienteId: cliente.id,
        canal: entrada.canal,
        status,
        totalCentavos: total,
        origem: origem ?? null,
      })
      .returning();
    if (!pedido) throw new ErroPedido('Não foi possível gravar o pedido.', 'item_invalido');

    await tx.insert(itensPedido).values(
      itens.map(({ tipo, pacote }) => ({
        pedidoId: pedido.id,
        tipoId: tipo.id,
        pacoteId: pacote.id,
        codigoTipo: tipo.codigo,
        quantidadeEmbrioes: pacote.quantidade,
        precoTotalCentavos: pacote.precoTotalCentavos,
        descricao: `Tipo ${tipo.codigo} · ${tipo.nome} · pacote de ${pacote.quantidade} embriões`,
      })),
    );
    await tx.insert(eventosPedido).values({ pedidoId: pedido.id, paraStatus: status, por: 'cliente', nota: entrada.canal === 'whatsapp' ? 'Pedido enviado pelo WhatsApp.' : null });

    return {
      numero: pedido.numero,
      token: pedido.token,
      totalCentavos: total,
      itens: itens.map(({ tipo, pacote }) => ({ codigo: tipo.codigo, nome: tipo.nome, quantidade: pacote.quantidade, precoTotalCentavos: pacote.precoTotalCentavos })),
      cliente: { nome: cliente.nome, cidade: cliente.cidade, uf: cliente.uf, whatsappE164: cliente.whatsappE164 },
      vendedorWhatsapp: vendedor.whatsappE164,
    };
  });
}

export interface PedidoDetalhe {
  id: string;
  numero: number;
  token: string;
  canal: 'whatsapp' | 'online';
  status: StatusPedido;
  totalCentavos: number;
  criadoEm: Date;
  atualizadoEm: Date;
  cliente: { nome: string; whatsappE164: string; documento: string | null; cidade: string; uf: string; propriedade: string | null; email: string | null; aceitaOfertas: boolean };
  itens: ItemCriado[];
  eventos: { de: StatusPedido | null; para: StatusPedido; por: string; nota: string | null; em: Date }[];
  vendedorWhatsapp: string;
}

async function detalhar(onde: ReturnType<typeof eq>): Promise<PedidoDetalhe | null> {
  const db = await banco();
  const [linha] = await db
    .select({ pedido: pedidos, cliente: clientes, vendedorWhatsapp: vendedores.whatsappE164 })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .innerJoin(vendedores, eq(vendedores.id, pedidos.vendedorId))
    .where(onde)
    .limit(1);
  if (!linha) return null;
  const [itens, eventos] = await Promise.all([
    db
      .select({ codigo: itensPedido.codigoTipo, nome: tipos.nome, quantidade: itensPedido.quantidadeEmbrioes, precoTotalCentavos: itensPedido.precoTotalCentavos })
      .from(itensPedido)
      .innerJoin(tipos, eq(tipos.id, itensPedido.tipoId))
      .where(eq(itensPedido.pedidoId, linha.pedido.id)),
    db.select().from(eventosPedido).where(eq(eventosPedido.pedidoId, linha.pedido.id)).orderBy(eventosPedido.em),
  ]);
  const p = linha.pedido;
  const c = linha.cliente;
  return {
    id: p.id,
    numero: p.numero,
    token: p.token,
    canal: p.canal,
    status: p.status,
    totalCentavos: p.totalCentavos,
    criadoEm: p.criadoEm,
    atualizadoEm: p.atualizadoEm,
    cliente: { nome: c.nome, whatsappE164: c.whatsappE164, documento: c.documento, cidade: c.cidade, uf: c.uf, propriedade: c.propriedade, email: c.email, aceitaOfertas: c.aceitaOfertas },
    itens,
    eventos: eventos.map((e) => ({ de: e.deStatus, para: e.paraStatus, por: e.por, nota: e.nota, em: e.em })),
    vendedorWhatsapp: linha.vendedorWhatsapp,
  };
}

export const obterPedidoPorToken = (token: string) => detalhar(eq(pedidos.token, token));
export const obterPedidoPorNumero = (numero: number) => detalhar(eq(pedidos.numero, numero));

export interface PedidoResumo {
  numero: number;
  canal: 'whatsapp' | 'online';
  status: StatusPedido;
  totalCentavos: number;
  criadoEm: Date;
  clienteNome: string;
  cidade: string;
  uf: string;
  descricao: string;
}

export async function listarPedidos(filtro: { status?: StatusPedido[]; canal?: 'whatsapp' | 'online' } = {}): Promise<PedidoResumo[]> {
  const db = await banco();
  const condicoes = [];
  if (filtro.status?.length) condicoes.push(inArray(pedidos.status, filtro.status));
  if (filtro.canal) condicoes.push(eq(pedidos.canal, filtro.canal));
  const linhas = await db
    .select({
      id: pedidos.id,
      numero: pedidos.numero,
      canal: pedidos.canal,
      status: pedidos.status,
      totalCentavos: pedidos.totalCentavos,
      criadoEm: pedidos.criadoEm,
      clienteNome: clientes.nome,
      cidade: clientes.cidade,
      uf: clientes.uf,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .where(condicoes.length ? and(...condicoes) : undefined)
    .orderBy(desc(pedidos.criadoEm))
    .limit(200);
  if (linhas.length === 0) return [];
  const itens = await db
    .select({ pedidoId: itensPedido.pedidoId, codigo: itensPedido.codigoTipo, quantidade: itensPedido.quantidadeEmbrioes })
    .from(itensPedido)
    .where(inArray(itensPedido.pedidoId, linhas.map((l) => l.id)));
  return linhas.map(({ id, ...l }) => ({
    ...l,
    descricao: itens
      .filter((i) => i.pedidoId === id)
      .map((i) => `Tipo ${i.codigo}, ${i.quantidade} embriões`)
      .join(' + '),
  }));
}

/** Muda o status respeitando as transições de @webgado/core e registra quem mudou. */
export async function mudarStatus(numero: number, para: StatusPedido, por: string, nota?: string): Promise<void> {
  const db = await banco();
  await db.transaction(async (tx) => {
    const [p] = await tx.select({ id: pedidos.id, status: pedidos.status }).from(pedidos).where(eq(pedidos.numero, numero)).limit(1);
    if (!p) throw new ErroPedido(`Pedido ${numero} não encontrado.`, 'nao_encontrado');
    if (!podeMudar(p.status, para)) throw new ErroPedido('Essa mudança de status não é permitida.', 'status_invalido');
    await tx.update(pedidos).set({ status: para, atualizadoEm: new Date() }).where(eq(pedidos.id, p.id));
    await tx.insert(eventosPedido).values({ pedidoId: p.id, deStatus: p.status, paraStatus: para, por, nota: nota || null });
  });
}

export interface ResumoMes {
  pedidosNoMes: number;
  emConversa: number;
  pendentes: number;
  faturadoCentavos: number;
  porTipo: { codigo: string; pedidos: number; embrioes: number; totalCentavos: number }[];
}

const STATUS_FATURADOS: StatusPedido[] = ['pago', 'em_preparacao', 'envio_agendado', 'entregue', 'concluido'];

export async function resumoDoMes(referencia = new Date()): Promise<ResumoMes> {
  const db = await banco();
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const doMes = gte(pedidos.criadoEm, inicio);
  const [contagem] = await db
    .select({
      total: sql<number>`count(*)::int`,
      emConversa: sql<number>`count(*) filter (where ${pedidos.status} = 'em_conversa')::int`,
      pendentes: sql<number>`count(*) filter (where ${pedidos.status} in ('aguardando_pagamento','pagamento_recusado','expirado'))::int`,
      faturado: sql<number>`coalesce(sum(${pedidos.totalCentavos}) filter (where ${inArray(pedidos.status, STATUS_FATURADOS)}), 0)::int`,
    })
    .from(pedidos)
    .where(doMes);
  const porTipo = await db
    .select({
      codigo: itensPedido.codigoTipo,
      pedidos: sql<number>`count(distinct ${itensPedido.pedidoId})::int`,
      embrioes: sql<number>`sum(${itensPedido.quantidadeEmbrioes})::int`,
      totalCentavos: sql<number>`sum(${itensPedido.precoTotalCentavos})::int`,
    })
    .from(itensPedido)
    .innerJoin(pedidos, eq(pedidos.id, itensPedido.pedidoId))
    .where(and(doMes, inArray(pedidos.status, STATUS_FATURADOS)))
    .groupBy(itensPedido.codigoTipo)
    .orderBy(itensPedido.codigoTipo);
  return {
    pedidosNoMes: contagem?.total ?? 0,
    emConversa: contagem?.emConversa ?? 0,
    pendentes: contagem?.pendentes ?? 0,
    faturadoCentavos: contagem?.faturado ?? 0,
    porTipo,
  };
}
