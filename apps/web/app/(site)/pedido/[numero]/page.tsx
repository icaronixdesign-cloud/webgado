import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { formatarReais, formatarTelefone, linkWhatsApp, mascararTelefone, mensagemPedido } from '@webgado/core';
import { obterPedidoPorToken } from '@webgado/db';
import { BotaoCopiar } from '@/componentes/BotaoCopiar';
import { IconeWhatsApp } from '@/componentes/IconeWhatsApp';
import { Passos } from '@/componentes/Passos';

export const metadata: Metadata = { title: 'Seu pedido', robots: { index: false, follow: false } };

type Props = { params: Promise<{ numero: string }>; searchParams: Promise<{ t?: string }> };

export default async function PedidoPronto({ params, searchParams }: Props) {
  const [{ numero }, { t }] = await Promise.all([params, searchParams]);
  const pedido = t && t.length >= 20 ? await obterPedidoPorToken(t) : null;
  if (!pedido || String(pedido.numero) !== numero) notFound();

  const mensagem = mensagemPedido({ numero: pedido.numero, itens: pedido.itens, ...pedido.cliente });
  const link = linkWhatsApp(pedido.vendedorWhatsapp, mensagem);

  return (
    <div className="wrap pb-24 pt-6 lg:pt-10">
      <div className="mx-auto flex max-w-[36rem] flex-col gap-8">
        <Passos atual={3} />
        <section className="wg-confirma" aria-labelledby="pronto-titulo">
          <span className="wg-confirma__icone" aria-hidden="true">
            <Check className="wg-ico" strokeWidth={2.5} />
          </span>
          <h1 id="pronto-titulo" className="t-h1">
            Seu pedido está pronto
          </h1>
          <p className="wg-confirma__numero">
            Número do seu pedido
            <strong>{pedido.numero}</strong>
          </p>
          <p className="t-abertura m-0">Falta um passo: mandar o pedido para o Filipe no WhatsApp. É só tocar no botão e depois em Enviar.</p>
          <div className="wg-confirma__acoes">
            <a className="wg-btn wg-btn--largo" href={link} target="_blank" rel="noopener noreferrer">
              <IconeWhatsApp />
              Enviar pedido ao Filipe
            </a>
          </div>
        </section>

        <section aria-labelledby="mensagem-titulo" className="flex flex-col gap-3">
          <h2 id="mensagem-titulo" className="t-h3">
            A mensagem que vai para ele
          </h2>
          <p id="mensagem-pedido" className="m-0 rounded-sm bg-fundo-2 p-4">
            {mensagem}
          </p>
          <BotaoCopiar texto={mensagem} rotulo="Copiar mensagem" alvoId="mensagem-pedido" />
          <p className="t-pequeno texto-2 m-0">
            Se o WhatsApp não abrir, copie a mensagem e mande para o número <span className="num font-semibold">{formatarTelefone(pedido.vendedorWhatsapp)}</span>.
          </p>
        </section>

        <section aria-labelledby="depois-titulo" className="flex flex-col gap-3">
          <h2 id="depois-titulo" className="t-h3">
            O que vem agora
          </h2>
          <ol className="wg-confirma__proximo">
            <li>O Filipe responde no seu WhatsApp ({mascararTelefone(pedido.cliente.whatsappE164)}).</li>
            <li>Vocês combinam o pagamento e a entrega.</li>
            <li>Guarde o número do pedido: {pedido.numero}.</li>
          </ol>
          <p className="m-0 texto-2 num">
            Total do pedido: <strong className="text-texto">{formatarReais(pedido.totalCentavos)}</strong>
          </p>
        </section>

        <Link href="/" className="wg-btn wg-btn--secundario wg-btn--largo">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
