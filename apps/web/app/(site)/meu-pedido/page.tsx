import type { Metadata } from 'next';
import { listarTipos } from '@webgado/db';
import { FormularioPedido, type TipoParaPedido } from '@/componentes/FormularioPedido';
import { PAGAMENTO_ONLINE } from '@/lib/site';

export const metadata: Metadata = { title: 'Meu pedido' };

export default async function MeuPedido() {
  const tipos = await listarTipos();
  const catalogo: TipoParaPedido[] = tipos.map((t) => ({
    codigo: t.codigo,
    nome: t.nome,
    slug: t.slug,
    capa: t.fotos[0] ?? null,
    pacotes: t.pacotes.map((p) => ({ quantidade: p.quantidade, precoTotalCentavos: p.precoTotalCentavos })),
  }));
  return (
    <div className="wrap pb-24 pt-6 lg:pt-10">
      <FormularioPedido catalogo={catalogo} pagamentoOnline={PAGAMENTO_ONLINE} />
    </div>
  );
}
