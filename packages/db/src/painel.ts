import { and, eq } from 'drizzle-orm';
import { conferirTabela, type Disponibilidade, type AvisoPreco } from '@webgado/core';
import { banco } from './cliente';
import { historicoPrecos, pacotes, tipos } from './schema';

export interface PrecoNovo {
  quantidade: number;
  precoTotalCentavos: number;
  ativo: boolean;
}

/**
 * Salva a tabela de um tipo inteira. Recusa se algum pacote ficar sem preço;
 * avisos de coerência (pacote maior mais caro por embrião) não impedem salvar, só voltam para a tela.
 */
export async function salvarPrecos(
  codigo: string,
  novos: PrecoNovo[],
  porUsuario: string,
  aprovar: boolean,
): Promise<{ avisos: AvisoPreco[] }> {
  const avisos = conferirTabela(novos);
  const bloqueantes = avisos.filter((a) => a.mensagem.includes('sem preço'));
  if (bloqueantes.length) return { avisos };

  const db = await banco();
  await db.transaction(async (tx) => {
    const [tipo] = await tx.select({ id: tipos.id }).from(tipos).where(eq(tipos.codigo, codigo)).limit(1);
    if (!tipo) throw new Error(`Tipo ${codigo} não encontrado.`);
    const atuais = await tx.select().from(pacotes).where(eq(pacotes.tipoId, tipo.id));
    for (const novo of novos) {
      const atual = atuais.find((p) => p.quantidade === novo.quantidade);
      if (!atual) {
        await tx.insert(pacotes).values({ tipoId: tipo.id, quantidade: novo.quantidade, precoTotalCentavos: novo.precoTotalCentavos, ativo: novo.ativo, ordem: novo.quantidade });
        continue;
      }
      if (atual.precoTotalCentavos === novo.precoTotalCentavos && atual.ativo === novo.ativo) continue;
      await tx.update(pacotes).set({ precoTotalCentavos: novo.precoTotalCentavos, ativo: novo.ativo }).where(and(eq(pacotes.id, atual.id)));
      if (atual.precoTotalCentavos !== novo.precoTotalCentavos) {
        await tx.insert(historicoPrecos).values({ pacoteId: atual.id, precoAntes: atual.precoTotalCentavos, precoDepois: novo.precoTotalCentavos, porUsuario });
      }
    }
    await tx
      .update(tipos)
      .set({ atualizadoEm: new Date(), ...(aprovar ? { statusPreco: 'aprovado' as const } : {}) })
      .where(eq(tipos.id, tipo.id));
  });
  return { avisos };
}

export interface CamposTipo {
  nome: string;
  resumo: string;
  disponibilidade: Disponibilidade;
  publicado: boolean;
  grauSangue: string | null;
  sexado: boolean | null;
  conservacao: 'fresco' | 'congelado' | 'ambos' | null;
  maeDescricao: string | null;
  paiDescricao: string | null;
  oQueInclui: string | null;
  prazoEntregaDias: number | null;
}

export async function atualizarTipo(codigo: string, campos: CamposTipo): Promise<void> {
  const db = await banco();
  const r = await db.update(tipos).set({ ...campos, atualizadoEm: new Date() }).where(eq(tipos.codigo, codigo)).returning({ id: tipos.id });
  if (r.length === 0) throw new Error(`Tipo ${codigo} não encontrado.`);
}

export async function atualizarWhatsappVendedor(whatsappE164: string): Promise<void> {
  const db = await banco();
  const { vendedores } = await import('./schema');
  await db.update(vendedores).set({ whatsappE164 }).where(eq(vendedores.ativo, true));
}
