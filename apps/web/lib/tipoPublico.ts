import { descontoPercentual, economia, precoPorEmbriao } from '@webgado/core';
import type { TipoCatalogo } from '@webgado/db';

/** Formato público de um tipo na API v1, com as contas de preço já feitas (o app mostra sem recalcular). */
export function tipoPublico(t: TipoCatalogo) {
  return {
    codigo: t.codigo,
    slug: t.slug,
    nome: t.nome,
    resumo: t.resumo,
    grauSangue: t.grauSangue,
    sexado: t.sexado,
    sexo: t.sexo,
    conservacao: t.conservacao,
    mae: t.maeDescricao,
    pai: t.paiDescricao,
    disponibilidade: t.disponibilidade,
    precoAprovado: t.statusPreco === 'aprovado',
    oQueInclui: t.oQueInclui,
    aPartirDeCentavos: t.aPartirDeCentavos,
    fotos: t.fotos,
    pacotes: t.pacotes.map((p) => ({
      quantidade: p.quantidade,
      precoTotalCentavos: p.precoTotalCentavos,
      precoPorEmbriaoCentavos: precoPorEmbriao(p),
      economiaCentavos: economia(p, t.pacotes),
      descontoPercentual: Math.round(descontoPercentual(p, t.pacotes) * 1000) / 10,
    })),
  };
}
