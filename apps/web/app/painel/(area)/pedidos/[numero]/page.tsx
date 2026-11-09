import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ROTULO_STATUS, formatarReais, formatarTelefone, linkWhatsApp, mascararDocumento, proximosStatus } from '@webgado/core';
import { obterPedidoPorNumero } from '@webgado/db';
import { IconeWhatsApp } from '@/componentes/IconeWhatsApp';
import { FormStatus } from './FormStatus';

export const metadata = { title: 'Pedido' };

const DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export default async function DetalhePedido({ params }: { params: Promise<{ numero: string }> }) {
  const numero = Number((await params).numero);
  const p = Number.isInteger(numero) ? await obterPedidoPorNumero(numero) : null;
  if (!p) notFound();
  const c = p.cliente;
  const proximos = proximosStatus(p.status).map((s) => ({ valor: s, rotulo: ROTULO_STATUS[s] }));

  return (
    <div className="flex flex-col gap-10">
      <Link href="/painel/pedidos" className="wg-link self-start">
        <ArrowLeft className="wg-ico" aria-hidden="true" />
        Todos os pedidos
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="t-h1">Pedido {p.numero}</h1>
        <p className="m-0 texto-2">
          {p.canal === 'whatsapp' ? 'Enviado pelo WhatsApp' : 'Pago pelo site'} em {DATA.format(p.criadoEm)} ·{' '}
          <span className="wg-chip wg-chip--neutro">{ROTULO_STATUS[p.status]}</span>
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="painel-bloco" aria-labelledby="cliente-titulo">
          <h2 id="cliente-titulo" className="t-h3">
            {c.nome}
          </h2>
          <dl className="painel-numeros [&_dd]:text-lg">
            <div>
              <dt>WhatsApp</dt>
              <dd>{formatarTelefone(c.whatsappE164)}</dd>
            </div>
            <div>
              <dt>Cidade</dt>
              <dd>
                {c.cidade}/{c.uf}
              </dd>
            </div>
            {c.propriedade ? (
              <div>
                <dt>Propriedade</dt>
                <dd>{c.propriedade}</dd>
              </div>
            ) : null}
            <div>
              <dt>CPF ou CNPJ</dt>
              <dd>{c.documento ? mascararDocumento(c.documento) : 'Não informou'}</dd>
            </div>
            {c.email ? (
              <div>
                <dt>E-mail</dt>
                <dd className="break-all">{c.email}</dd>
              </div>
            ) : null}
            <div>
              <dt>Aceita ofertas</dt>
              <dd>{c.aceitaOfertas ? 'Sim' : 'Não'}</dd>
            </div>
          </dl>
          <a className="wg-btn wg-btn--largo" href={linkWhatsApp(c.whatsappE164, `Olá, ${c.nome.split(' ')[0]}! Aqui é o Filipe, da Girolando Passos, sobre o seu pedido nº ${p.numero}.`)} target="_blank" rel="noopener noreferrer">
            <IconeWhatsApp />
            Abrir conversa no WhatsApp
          </a>
        </section>

        <section className="painel-bloco" aria-labelledby="itens-titulo">
          <h2 id="itens-titulo" className="t-h3">
            Itens
          </h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {p.itens.map((i) => (
              <li key={i.codigo} className="flex justify-between gap-4 border-b border-divisor py-3">
                <span>
                  <strong className="block">
                    Tipo {i.codigo} · {i.quantidade} embriões
                  </strong>
                  <span className="texto-2">{i.nome}</span>
                </span>
                <span className="font-semibold num">{formatarReais(i.precoTotalCentavos)}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 flex justify-between text-xl font-semibold num">
            <span>Total</span>
            <span>{formatarReais(p.totalCentavos)}</span>
          </p>
        </section>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="painel-bloco" aria-labelledby="status-titulo">
          <h2 id="status-titulo" className="t-h3">
            Mudar status
          </h2>
          {proximos.length ? (
            <FormStatus numero={p.numero} opcoes={proximos} />
          ) : (
            <p className="m-0 texto-2">Este pedido já terminou. Não há próximo status.</p>
          )}
        </section>

        <section className="painel-bloco" aria-labelledby="historico-titulo">
          <h2 id="historico-titulo" className="t-h3">
            Histórico
          </h2>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {[...p.eventos].reverse().map((e, i) => (
              <li key={i} className="border-b border-divisor pb-3">
                <strong className="block">{ROTULO_STATUS[e.para]}</strong>
                <span className="t-pequeno texto-2">
                  {DATA.format(e.em)} · {e.por === 'cliente' ? 'pelo comprador' : e.por === 'filipe' ? 'pelo Filipe' : e.por}
                  {e.nota ? ` · ${e.nota}` : ''}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
