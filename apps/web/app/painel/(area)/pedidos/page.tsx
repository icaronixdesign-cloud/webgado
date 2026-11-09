import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ROTULO_STATUS, formatarReais, type StatusPedido } from '@webgado/core';
import { listarPedidos } from '@webgado/db';

export const metadata = { title: 'Pedidos' };

const FILTROS: { id: string; rotulo: string; status?: StatusPedido[] }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'conversa', rotulo: 'Em conversa', status: ['em_conversa'] },
  { id: 'andamento', rotulo: 'Pagos e em andamento', status: ['pago', 'em_preparacao', 'envio_agendado', 'entregue'] },
  { id: 'fechados', rotulo: 'Concluídos', status: ['concluido'] },
  { id: 'perdidos', rotulo: 'Não fecharam', status: ['perdido', 'cancelado', 'reembolsado'] },
];

const DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const filtro = FILTROS.find((x) => x.id === f) ?? FILTROS[0]!;
  const pedidos = await listarPedidos({ status: filtro.status });
  return (
    <div className="flex flex-col gap-6">
      <h1 className="t-h1">Pedidos</h1>
      <nav aria-label="Filtrar pedidos" className="painel-nav">
        {FILTROS.map((x) => (
          <Link key={x.id} href={x.id === 'todos' ? '/painel/pedidos' : `/painel/pedidos?f=${x.id}`} aria-current={x.id === filtro.id ? 'page' : undefined}>
            {x.rotulo}
          </Link>
        ))}
      </nav>
      {pedidos.length === 0 ? (
        <p className="m-0 texto-2">Nenhum pedido neste filtro.</p>
      ) : (
        <div className="flex flex-col">
          {pedidos.map((p) => (
            <Link key={p.numero} href={`/painel/pedidos/${p.numero}`} className="painel-linha">
              <span className="min-w-0">
                <strong className="block">
                  Pedido {p.numero} · {p.clienteNome}
                </strong>
                <span className="texto-2">
                  {p.descricao} · {p.cidade}/{p.uf} · {DATA.format(p.criadoEm)}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-3">
                <span className="wg-chip wg-chip--neutro">{ROTULO_STATUS[p.status]}</span>
                <span className="font-semibold num">{formatarReais(p.totalCentavos)}</span>
                <ArrowRight className="wg-ico text-acao" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
