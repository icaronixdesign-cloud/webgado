import type { Metadata } from 'next';
import { listarTipos } from '@webgado/db';
import { Comparador, type TipoComparado } from '@/componentes/Comparador';

export const metadata: Metadata = {
  title: 'Comparar os tipos',
  description: 'Os tipos de embrião Girolando da Girolando Passos lado a lado: preço, grau de sangue, sexado, mãe, pai e disponibilidade.',
};

export default async function Comparar() {
  const tipos = await listarTipos();
  const dados: TipoComparado[] = tipos.map((t) => ({
    codigo: t.codigo,
    slug: t.slug,
    nome: t.nome,
    grauSangue: t.grauSangue,
    sexado: t.sexado,
    sexo: t.sexo,
    mae: t.maeDescricao,
    pai: t.paiDescricao,
    disponibilidade: t.disponibilidade,
    pacotes: t.pacotes.map((p) => ({ quantidade: p.quantidade, precoTotalCentavos: p.precoTotalCentavos })),
  }));
  return (
    <div className="wrap pb-24 pt-8 lg:pt-12">
      <div className="mb-8 flex max-w-[44rem] flex-col gap-2">
        <h1 className="t-h1">Comparar os tipos</h1>
        <p className="m-0 texto-2">Escolha dois tipos para ver lado a lado. No computador, todos aparecem juntos.</p>
      </div>
      <Comparador tipos={dados} />
    </div>
  );
}
