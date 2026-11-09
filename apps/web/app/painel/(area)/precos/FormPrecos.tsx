'use client';

import { useState, useTransition } from 'react';
import { aplicarDescontosPadrao, conferirTabela, descontoPercentual, economia, formatarReais, lerReais, precoPorEmbriao } from '@webgado/core';
import { Aviso, SeloTipo } from '@/componentes/Selos';
import { salvarPrecosAcao, type Resultado } from '../../acoes';

interface Pacote {
  quantidade: number;
  precoTotalCentavos: number;
  ativo: boolean;
}

const paraTexto = (centavos: number) => (centavos / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function FormPrecos({ codigo, nome, aprovado, pacotes }: { codigo: string; nome: string; aprovado: boolean; pacotes: Pacote[] }) {
  const [linhas, setLinhas] = useState(pacotes.map((p) => ({ quantidade: p.quantidade, texto: paraTexto(p.precoTotalCentavos), ativo: p.ativo })));
  const [aprovar, setAprovar] = useState(aprovado);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pendente, iniciar] = useTransition();

  const lidos = linhas.map((l) => ({ quantidade: l.quantidade, precoTotalCentavos: lerReais(l.texto) ?? 0, ativo: l.ativo }));
  const avisosAoVivo = conferirTabela(lidos);
  const mudou = linhas.some((l, i) => lerReais(l.texto) !== pacotes[i]?.precoTotalCentavos || l.ativo !== pacotes[i]?.ativo) || aprovar !== aprovado;

  function aplicarPadrao() {
    const doze = lidos.find((l) => l.quantidade === 12)?.precoTotalCentavos;
    if (!doze) return;
    const sugeridos = aplicarDescontosPadrao(doze, linhas.map((l) => l.quantidade));
    setLinhas((ls) => ls.map((l) => ({ ...l, texto: paraTexto(sugeridos.find((s) => s.quantidade === l.quantidade)?.precoTotalCentavos ?? 0) })));
  }

  return (
    <form
      className="painel-bloco"
      aria-labelledby={`precos-${codigo}`}
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => setResultado(await salvarPrecosAcao(codigo, linhas, aprovar)));
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <SeloTipo codigo={codigo} />
        <h2 id={`precos-${codigo}`} className="t-h3">
          {nome}
        </h2>
        {!aprovado ? <span className="wg-chip wg-chip--alerta">Proposta</span> : null}
      </div>

      <div className="painel-precos">
        {linhas.map((l, i) => {
          const lido = lidos[i]!;
          const valido = lido.precoTotalCentavos > 0;
          const eco = valido ? economia(lido, lidos) : 0;
          const desc = valido ? descontoPercentual(lido, lidos) : 0;
          const id = `preco-${codigo}-${l.quantidade}`;
          return (
            <div key={l.quantidade} className="wg-campo">
              <label htmlFor={id}>{l.quantidade} embriões</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl texto-2" aria-hidden="true">
                  R$
                </span>
                <input
                  id={id}
                  inputMode="decimal"
                  className="!pl-12 num"
                  value={l.texto}
                  aria-describedby={`${id}-conta`}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, texto: v } : x)));
                  }}
                />
              </div>
              <p id={`${id}-conta`} className="wg-campo__ajuda num">
                {valido ? `${formatarReais(precoPorEmbriao(lido))} por embrião` : 'Sem preço'}
                {eco > 0 ? ` · economia de ${formatarReais(eco)} (${Math.round(desc * 100)}%)` : ''}
              </p>
              <label className="flex min-h-11 items-center gap-2 text-base font-normal">
                <input
                  type="checkbox"
                  className="h-6 w-6"
                  checked={l.ativo}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, ativo: v } : x)));
                  }}
                />
                À venda
              </label>
            </div>
          );
        })}
      </div>

      {avisosAoVivo.map((a) => (
        <Aviso key={a.quantidade + a.mensagem} tom="alerta" titulo={a.mensagem} />
      ))}

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <button type="button" className="wg-btn wg-btn--neutro wg-btn--medio" onClick={aplicarPadrao}>
          Aplicar descontos padrão (10%, 17%, 25%)
        </button>
        {!aprovado ? (
          <label className="wg-marcar md:min-h-0">
            <input type="checkbox" checked={aprovar} onChange={(e) => setAprovar(e.target.checked)} />
            <span>Preços aprovados pelo Filipe</span>
          </label>
        ) : null}
      </div>

      {resultado ? <Aviso tom={resultado.ok ? 'ok' : 'erro'} titulo={resultado.mensagem} /> : null}

      <button type="submit" className="wg-btn md:self-start" aria-busy={pendente} disabled={pendente || !mudou}>
        {pendente ? 'Salvando…' : `Salvar preços do Tipo ${codigo}`}
      </button>
    </form>
  );
}
