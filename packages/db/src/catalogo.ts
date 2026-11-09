import { asc, eq, inArray } from 'drizzle-orm';
import { aPartirDe, type Disponibilidade } from '@webgado/core';
import { banco } from './cliente';
import { midias, pacotes, tipos, vendedores } from './schema';

export interface PacoteCatalogo {
  id: string;
  quantidade: number;
  precoTotalCentavos: number;
  ativo: boolean;
}

export interface FotoCatalogo {
  url: string;
  alt: string;
}

export interface TipoCatalogo {
  id: string;
  codigo: string;
  slug: string;
  nome: string;
  resumo: string;
  descricao: string | null;
  grauSangue: string | null;
  sexado: boolean | null;
  sexo: string | null;
  conservacao: 'fresco' | 'congelado' | 'ambos' | null;
  maeDescricao: string | null;
  paiDescricao: string | null;
  disponibilidade: Disponibilidade;
  prazoEntregaDias: number | null;
  oQueInclui: string | null;
  videoUrl: string | null;
  publicado: boolean;
  statusPreco: 'aprovado' | 'proposta';
  pacotes: PacoteCatalogo[];
  fotos: FotoCatalogo[];
  aPartirDeCentavos: number | null;
}

export interface Vendedor {
  nome: string;
  whatsappE164: string;
  cidade: string;
  uf: string;
  instagram: string | null;
}

export async function vendedorPrincipal(): Promise<Vendedor> {
  if (process.env.WEBGADO_DIAGNOSTICO) console.log('[diag] vendedorPrincipal: pedindo conexão');
  const db = await banco();
  if (process.env.WEBGADO_DIAGNOSTICO) console.log('[diag] vendedorPrincipal: conexão ok, consultando');
  const [v] = await db
    .select({ nome: vendedores.nome, whatsappE164: vendedores.whatsappE164, cidade: vendedores.cidade, uf: vendedores.uf, instagram: vendedores.instagram })
    .from(vendedores)
    .where(eq(vendedores.ativo, true))
    .limit(1);
  if (!v) throw new Error('Nenhum vendedor cadastrado.');
  return v;
}

/** Todos os tipos com pacotes e fotos. Por padrão, só os publicados e não indisponíveis (a vitrine). */
export async function listarTipos(opcoes: { incluirOcultos?: boolean } = {}): Promise<TipoCatalogo[]> {
  const db = await banco();
  const linhas = await db.select().from(tipos).orderBy(asc(tipos.ordem));
  const visiveis = opcoes.incluirOcultos ? linhas : linhas.filter((t) => t.publicado && t.disponibilidade !== 'indisponivel');
  if (visiveis.length === 0) return [];
  const ids = visiveis.map((t) => t.id);
  const [listaPacotes, listaFotos] = await Promise.all([
    db.select().from(pacotes).where(inArray(pacotes.tipoId, ids)).orderBy(asc(pacotes.quantidade)),
    db.select().from(midias).where(inArray(midias.tipoId, ids)).orderBy(asc(midias.ordem)),
  ]);
  return visiveis.map((t) => {
    const ps = listaPacotes
      .filter((p) => p.tipoId === t.id && (opcoes.incluirOcultos || p.ativo))
      .map((p) => ({ id: p.id, quantidade: p.quantidade, precoTotalCentavos: p.precoTotalCentavos, ativo: p.ativo }));
    return {
      id: t.id,
      codigo: t.codigo,
      slug: t.slug,
      nome: t.nome,
      resumo: t.resumo,
      descricao: t.descricao,
      grauSangue: t.grauSangue,
      sexado: t.sexado,
      sexo: t.sexo,
      conservacao: t.conservacao,
      maeDescricao: t.maeDescricao,
      paiDescricao: t.paiDescricao,
      disponibilidade: t.disponibilidade,
      prazoEntregaDias: t.prazoEntregaDias,
      oQueInclui: t.oQueInclui,
      videoUrl: t.videoUrl,
      publicado: t.publicado,
      statusPreco: t.statusPreco,
      pacotes: ps,
      fotos: listaFotos.filter((f) => f.tipoId === t.id && f.tipo === 'foto').map((f) => ({ url: f.url, alt: f.alt })),
      aPartirDeCentavos: aPartirDe(ps) ?? null,
    };
  });
}

export async function obterTipo(slugOuCodigo: string, opcoes: { incluirOcultos?: boolean } = {}): Promise<TipoCatalogo | null> {
  const chave = slugOuCodigo.toLowerCase();
  const todos = await listarTipos(opcoes);
  return todos.find((t) => t.slug === chave || t.codigo.toLowerCase() === chave) ?? null;
}
