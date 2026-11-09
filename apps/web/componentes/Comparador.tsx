'use client';

import Link from 'next/link';
import { useState } from 'react';
import { aPartirDe, formatarReais, precoPorEmbriao, type Disponibilidade } from '@webgado/core';
import { ChipDisponibilidade, SeloTipo } from './Selos';

export interface TipoComparado {
  codigo: string;
  slug: string;
  nome: string;
  grauSangue: string | null;
  sexado: boolean | null;
  sexo: string | null;
  mae: string | null;
  pai: string | null;
  disponibilidade: Disponibilidade;
  pacotes: { quantidade: number; precoTotalCentavos: number }[];
}

interface Linha {
  rotulo: string;
  valor: (t: TipoComparado) => React.ReactNode;
}

const aConfirmar = <span className="font-normal text-alerta">A confirmar</span>;

const LINHAS: Linha[] = [
  {
    rotulo: 'A partir de',
    valor: (t) => {
      const menor = [...t.pacotes].sort((a, b) => a.quantidade - b.quantidade)[0];
      const v = aPartirDe(t.pacotes);
      return v ? (
        <span className="num">
          {formatarReais(v)}
          {menor ? <small>pacote de {menor.quantidade}</small> : null}
        </span>
      ) : (
        aConfirmar
      );
    },
  },
  {
    rotulo: 'Maior pacote',
    valor: (t) => {
      const maior = [...t.pacotes].sort((a, b) => b.quantidade - a.quantidade)[0];
      return maior ? (
        <span className="num">
          {formatarReais(maior.precoTotalCentavos)}
          <small>
            {maior.quantidade} embriões · <span className="whitespace-nowrap">{formatarReais(precoPorEmbriao(maior))} cada</span>
          </small>
        </span>
      ) : (
        aConfirmar
      );
    },
  },
  { rotulo: 'Grau de sangue', valor: (t) => (t.grauSangue ? `${t.grauSangue} sangue` : aConfirmar) },
  { rotulo: 'Sexado', valor: (t) => (t.sexado === null ? aConfirmar : t.sexado ? `Sim, ${t.sexo === 'macho' ? 'macho' : 'fêmea'}` : 'Não') },
  { rotulo: 'Mãe', valor: (t) => t.mae ?? aConfirmar },
  { rotulo: 'Pai', valor: (t) => t.pai ?? aConfirmar },
  { rotulo: 'Disponibilidade', valor: (t) => <ChipDisponibilidade valor={t.disponibilidade} /> },
];

export function Comparador({ tipos }: { tipos: TipoComparado[] }) {
  const [esquerda, setEsquerda] = useState(tipos[0]?.codigo ?? '');
  const [direita, setDireita] = useState(tipos[1]?.codigo ?? tipos[0]?.codigo ?? '');
  const par = [tipos.find((t) => t.codigo === esquerda), tipos.find((t) => t.codigo === direita)].filter((t): t is TipoComparado => Boolean(t));

  return (
    <>
      {/* Celular e tablet: dois por vez */}
      <div className="flex flex-col gap-6 lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'comparar-1', rotulo: 'Comparar o', valor: esquerda, mudar: setEsquerda },
            { id: 'comparar-2', rotulo: 'com o', valor: direita, mudar: setDireita },
          ].map((s) => (
            <div key={s.id} className="wg-campo">
              <label htmlFor={s.id}>{s.rotulo}</label>
              <select id={s.id} value={s.valor} onChange={(e) => s.mudar(e.target.value)}>
                {tipos.map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    Tipo {t.codigo}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 border-b-2 border-texto pb-4" aria-hidden="true">
          {par.map((t, i) => (
            <div key={`${t.codigo}-${i}`} className="flex flex-col items-start gap-2">
              <SeloTipo codigo={t.codigo} />
              <p className="m-0 font-semibold leading-snug">{t.nome}</p>
            </div>
          ))}
        </div>
        <dl className="m-0 flex flex-col">
          {LINHAS.map((l) => (
            <div key={l.rotulo} className="border-b border-divisor py-3">
              <dt className="texto-2 mb-1">{l.rotulo}</dt>
              <dd className="m-0 grid grid-cols-2 gap-3 font-semibold [&_small]:block [&_small]:text-base [&_small]:font-normal [&_small]:text-texto-2">
                {par.map((t, i) => (
                  <span key={`${t.codigo}-${i}`} aria-label={`Tipo ${t.codigo}`}>
                    {l.valor(t)}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-3">
          {par.map((t, i) => (
            <Link key={`${t.codigo}-${i}`} href={`/embrioes/${t.slug}`} className="wg-btn wg-btn--medio">
              Ver tipo {t.codigo}
            </Link>
          ))}
        </div>
      </div>

      {/* Computador: todos lado a lado */}
      <div className="hidden lg:block">
        <table className="comparar-tabela">
          <caption className="wg-sr">Os tipos de embrião lado a lado</caption>
          <thead>
            <tr>
              <td />
              {tipos.map((t) => (
                <th key={t.codigo} scope="col">
                  <span className="flex flex-col items-start gap-2">
                    <SeloTipo codigo={t.codigo} />
                    <span className="font-semibold leading-snug">{t.nome}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((l) => (
              <tr key={l.rotulo}>
                <th scope="row">{l.rotulo}</th>
                {tipos.map((t) => (
                  <td key={t.codigo}>{l.valor(t)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {tipos.map((t) => (
                <td key={t.codigo}>
                  <Link href={`/embrioes/${t.slug}`} className="wg-btn wg-btn--medio wg-btn--largo">
                    Ver tipo {t.codigo}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
