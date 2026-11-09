'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { economia, formatarReais, linkWhatsApp, mensagemDuvida, precoPorEmbriao, type CodigoTipo } from '@webgado/core';
import { colocarNoPedido, useMeuPedido } from '@/lib/carrinho';
import { IconeWhatsApp } from './IconeWhatsApp';

interface Pacote {
  quantidade: number;
  precoTotalCentavos: number;
}

/** Seletor de pacote + preço + "Comprar agora", e a barra fixa no celular quando o preço sai da tela. */
export function CompraTipo({ codigo, pacotes, numeroWhatsapp, disponivel }: { codigo: CodigoTipo; pacotes: Pacote[]; numeroWhatsapp: string; disponivel: boolean }) {
  const router = useRouter();
  const noPedido = useMeuPedido().find((i) => i.tipo === codigo);
  const inicial = pacotes.find((p) => p.quantidade === noPedido?.quantidade)?.quantidade ?? pacotes[0]?.quantidade ?? 0;
  const [escolhido, setEscolhido] = useState(inicial);
  const [mostrado, setMostrado] = useState(inicial);
  const [trocando, setTrocando] = useState(false);
  const [barraVisivel, setBarraVisivel] = useState(false);
  const blocoRef = useRef<HTMLDivElement>(null);

  // Troca de preço: some e volta em 160 ms (só opacidade). Sem número contando.
  useEffect(() => {
    if (escolhido === mostrado) return;
    setTrocando(true);
    const t = window.setTimeout(() => {
      setMostrado(escolhido);
      setTrocando(false);
    }, 160);
    return () => window.clearTimeout(t);
  }, [escolhido, mostrado]);

  // A barra de compra aparece quando o bloco de preço e os botões saem da tela.
  useEffect(() => {
    const alvo = blocoRef.current;
    if (!alvo || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => {
      const passou = !e?.isIntersecting && (e?.boundingClientRect.top ?? 0) < 0;
      setBarraVisivel(passou);
    });
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  // O botão do WhatsApp sobe para não ficar em cima da barra.
  useEffect(() => {
    const raiz = document.documentElement;
    const largo = window.matchMedia('(min-width: 1024px)').matches;
    raiz.style.setProperty('--folga-barra', barraVisivel && !largo ? '88px' : '0px');
    return () => {
      raiz.style.removeProperty('--folga-barra');
    };
  }, [barraVisivel]);

  const pacote = pacotes.find((p) => p.quantidade === mostrado);
  const eco = pacote ? economia(pacote, pacotes) : 0;

  function comprar() {
    colocarNoPedido({ tipo: codigo, quantidade: escolhido });
    router.push('/meu-pedido');
  }

  if (!pacote) return null;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="wg-pacotes">
        <legend>Escolha o pacote</legend>
        <div className="wg-pacotes__grade">
          {pacotes.map((p) => (
            <label key={p.quantidade} className="wg-pacote">
              <input type="radio" name={`pacote-${codigo}`} value={p.quantidade} checked={escolhido === p.quantidade} onChange={() => setEscolhido(p.quantidade)} />
              <span className="wg-pacote__caixa">
                <span className="wg-pacote__qtd">{p.quantidade} embriões</span>
                <span className="wg-pacote__valor">{formatarReais(p.precoTotalCentavos)}</span>
                <span className="wg-pacote__check" aria-hidden="true">
                  <Check className="wg-ico" strokeWidth={3} />
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div ref={blocoRef} className="flex flex-col gap-6">
        <div className={`wg-preco${trocando ? ' wg-trocando' : ''}`} aria-live="polite">
          <span className="wg-preco__rotulo">Total do pacote de {pacote.quantidade}</span>
          <span className="wg-preco__total">{formatarReais(pacote.precoTotalCentavos)}</span>
          <span className="wg-preco__unit">{formatarReais(precoPorEmbriao(pacote))} por embrião</span>
          {eco > 0 ? <span className="wg-preco__economia">Você economiza {formatarReais(eco)}</span> : null}
        </div>

        <div className="flex flex-col gap-3">
          {disponivel ? (
            <button type="button" className="wg-btn wg-btn--largo" onClick={comprar}>
              Comprar agora
            </button>
          ) : null}
          <a className="wg-btn wg-btn--secundario wg-btn--largo" href={linkWhatsApp(numeroWhatsapp, mensagemDuvida(codigo))} target="_blank" rel="noopener noreferrer">
            <IconeWhatsApp />
            Tirar dúvida no WhatsApp
          </a>
        </div>
      </div>

      {disponivel ? (
        <div className="wg-barra" data-visivel={barraVisivel ? 'true' : 'false'} aria-hidden={!barraVisivel}>
          <div className="wg-barra__preco">
            <strong>{formatarReais(pacote.precoTotalCentavos)}</strong>
            <span>
              {pacote.quantidade} embriões · Tipo {codigo}
            </span>
          </div>
          <button type="button" className="wg-btn" onClick={comprar} tabIndex={barraVisivel ? 0 : -1}>
            Comprar agora
          </button>
        </div>
      ) : null}
    </div>
  );
}
