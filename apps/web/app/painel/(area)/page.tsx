import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatarReais, formatarTelefone } from '@webgado/core';
import { listarPedidos, resumoDoMes, vendedorPrincipal } from '@webgado/db';
import { FormWhatsapp } from './FormWhatsapp';

export const metadata = { title: 'Resumo' };

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export default async function Resumo() {
  const agora = new Date();
  const [resumo, emConversa, vendedor] = await Promise.all([resumoDoMes(agora), listarPedidos({ status: ['em_conversa'] }), vendedorPrincipal()]);
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4" aria-labelledby="mes-titulo">
        <h1 id="mes-titulo" className="t-h1">
          Resumo de {MESES[agora.getMonth()]}
        </h1>
        <dl className="painel-numeros max-w-[36rem]">
          <div>
            <dt>Pedidos no mês</dt>
            <dd>{resumo.pedidosNoMes}</dd>
          </div>
          <div>
            <dt>Em conversa no WhatsApp</dt>
            <dd>{resumo.emConversa}</dd>
          </div>
          <div>
            <dt>Esperando pagamento</dt>
            <dd>{resumo.pendentes}</dd>
          </div>
          <div>
            <dt>Faturado (pedidos pagos)</dt>
            <dd>{formatarReais(resumo.faturadoCentavos)}</dd>
          </div>
        </dl>
        {resumo.porTipo.length ? (
          <table className="comparar-tabela max-w-[36rem]">
            <caption className="t-legenda mb-2 text-left">Vendas pagas por tipo</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Pedidos</th>
                <th scope="col">Embriões</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {resumo.porTipo.map((t) => (
                <tr key={t.codigo}>
                  <td>Tipo {t.codigo}</td>
                  <td className="num">{t.pedidos}</td>
                  <td className="num">{t.embrioes}</td>
                  <td className="num">{formatarReais(t.totalCentavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="m-0 texto-2">Nenhuma venda paga este mês ainda.</p>
        )}
      </section>

      <section className="flex flex-col gap-2" aria-labelledby="conversa-titulo">
        <h2 id="conversa-titulo" className="t-h2">
          Em conversa no WhatsApp
        </h2>
        {emConversa.length === 0 ? (
          <p className="m-0 texto-2">Nenhum pedido esperando resposta. Quando alguém enviar um pedido pelo site, ele aparece aqui.</p>
        ) : (
          emConversa.slice(0, 8).map((p) => (
            <Link key={p.numero} href={`/painel/pedidos/${p.numero}`} className="painel-linha">
              <span>
                <strong className="block">
                  Pedido {p.numero} · {p.clienteNome}
                </strong>
                <span className="texto-2">
                  {p.descricao} · {p.cidade}/{p.uf}
                </span>
              </span>
              <span className="flex items-center gap-2 font-semibold num">
                {formatarReais(p.totalCentavos)}
                <ArrowRight className="wg-ico text-acao" aria-hidden="true" />
              </span>
            </Link>
          ))
        )}
        <Link href="/painel/pedidos" className="wg-link mt-2 self-start">
          Ver todos os pedidos
        </Link>
      </section>

      <section className="flex max-w-[28rem] flex-col gap-4" aria-labelledby="zap-titulo">
        <h2 id="zap-titulo" className="t-h2">
          WhatsApp dos pedidos
        </h2>
        <p className="m-0 texto-2">
          Hoje os pedidos vão para <span className="num font-semibold text-texto">{formatarTelefone(vendedor.whatsappE164)}</span>.
        </p>
        <FormWhatsapp atual={formatarTelefone(vendedor.whatsappE164)} />
      </section>
    </div>
  );
}
