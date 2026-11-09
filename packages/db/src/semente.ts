import { sql } from 'drizzle-orm';
import type { Banco } from './cliente';
import { midias, pacotes, tipos, vendedores } from './schema';

/**
 * Dados iniciais da demo. O tipo A segue a tabela real 2026 da Girolando Passos;
 * B a E são a proposta do briefing (status "proposta") até o Filipe aprovar.
 * As fotos vêm do Instagram @girolandopassos, só para a demo.
 */
const TABELA: Record<string, [number, number, number, number]> = {
  A: [10_000, 18_000, 25_000, 30_000],
  B: [8_500, 15_500, 21_500, 25_500],
  C: [7_000, 13_000, 18_000, 21_500],
  D: [6_000, 11_000, 15_000, 18_000],
  E: [5_000, 9_000, 12_500, 15_000],
};

const TIPOS = [
  {
    codigo: 'A',
    nome: '1/2 sangue sexado de fêmea',
    resumo: 'Vaca Gir com touro Holandês.',
    grauSangue: '1/2',
    sexado: true,
    sexo: 'femea',
    maeDescricao: 'Vaca Gir leiteiro',
    paiDescricao: 'Touro Holandês',
    disponibilidade: 'disponivel' as const,
    statusPreco: 'aprovado' as const,
  },
  {
    codigo: 'B',
    nome: 'Genética de destaque',
    resumo: 'Sexado de fêmea.',
    sexado: true,
    sexo: 'femea',
    disponibilidade: 'disponivel' as const,
    statusPreco: 'proposta' as const,
  },
  {
    codigo: 'C',
    nome: 'Boa genética leiteira',
    resumo: 'Ficha a confirmar com o Filipe.',
    disponibilidade: 'poucas_unidades' as const,
    statusPreco: 'proposta' as const,
  },
  {
    codigo: 'D',
    nome: 'Custo-benefício',
    resumo: 'Para aumentar o rebanho.',
    disponibilidade: 'disponivel' as const,
    statusPreco: 'proposta' as const,
  },
  {
    codigo: 'E',
    nome: 'Entrada',
    resumo: 'Para quem está começando.',
    disponibilidade: 'sob_encomenda' as const,
    statusPreco: 'proposta' as const,
  },
];

/**
 * Fotos por tipo: [arquivo em /public/fotos, texto alternativo]. A primeira é a capa.
 * Só o tipo A tem fotos por enquanto (do Instagram da Girolando Passos). Os outros mostram o selo
 * até chegarem fotos dos pais de cada tipo: foto de outro animal não pode passar por foto do tipo.
 */
const FOTOS: Record<string, [string, string][]> = {
  A: [
    ['bezerras-brinco-curral.jpg', 'Bezerras Girolando com brinco amarelo no curral da Girolando Passos'],
    ['bezerras-deitadas-pasto.jpg', 'Bezerras Gir malhadas deitadas no pasto'],
  ],
};

export async function semear(db: Banco): Promise<void> {
  await db.transaction(async (tx) => {
    const [gp] = await tx
      .insert(vendedores)
      .values({
        nome: 'Girolando Passos',
        slug: 'girolando-passos',
        whatsappE164: '5535988442603',
        cidade: 'Passos',
        uf: 'MG',
        instagram: 'girolandopassos',
      })
      .returning({ id: vendedores.id });
    if (!gp) throw new Error('Não foi possível criar o vendedor.');

    for (const [ordem, t] of TIPOS.entries()) {
      const [tipo] = await tx
        .insert(tipos)
        .values({ ...t, vendedorId: gp.id, slug: `tipo-${t.codigo.toLowerCase()}`, ordem })
        .returning({ id: tipos.id });
      if (!tipo) throw new Error(`Não foi possível criar o tipo ${t.codigo}.`);
      const precos = TABELA[t.codigo]!;
      await tx.insert(pacotes).values(
        [12, 24, 36, 48].map((quantidade, i) => ({
          tipoId: tipo.id,
          quantidade,
          precoTotalCentavos: precos[i]! * 100,
          ordem: i,
        })),
      );
      const fotos = FOTOS[t.codigo] ?? [];
      if (fotos.length) {
        await tx.insert(midias).values(
          fotos.map(([arquivo, alt], i) => ({ tipoId: tipo.id, url: `/fotos/${arquivo}`, alt, ordem: i, credito: '@girolandopassos' })),
        );
      }
    }
  });
}

export async function semearSeVazio(db: Banco): Promise<boolean> {
  const linhas = await db.select({ n: sql<number>`count(*)::int` }).from(vendedores);
  if ((linhas[0]?.n ?? 0) > 0) return false;
  await semear(db);
  return true;
}
