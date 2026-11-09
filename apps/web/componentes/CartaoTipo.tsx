import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatarReais } from '@webgado/core';
import type { TipoCatalogo } from '@webgado/db';
import { ChipDisponibilidade, SeloTipo, TileBrinco } from './Selos';

export function CartaoTipo({ tipo, destaque = false }: { tipo: TipoCatalogo; destaque?: boolean }) {
  const capa = tipo.fotos[0];
  return (
    <Link href={`/embrioes/${tipo.slug}`} className={`wg-cartao${destaque ? ' wg-cartao--destaque' : ''}`}>
      <div className="wg-cartao__foto">
        {capa ? (
          <Image src={capa.url} alt={capa.alt} fill sizes={destaque ? '(min-width: 768px) 50vw, 128px' : '(min-width: 1024px) 280px, (min-width: 768px) 45vw, 128px'} />
        ) : (
          <TileBrinco codigo={tipo.codigo} />
        )}
      </div>
      <div className="wg-cartao__lado">
        <SeloTipo codigo={tipo.codigo} />
        {tipo.aPartirDeCentavos ? (
          <span className="wg-cartao__apartir num">
            a partir de <strong>{formatarReais(tipo.aPartirDeCentavos)}</strong>
          </span>
        ) : null}
      </div>
      <div className="wg-cartao__corpo">
        <h3 className="wg-cartao__titulo">{tipo.nome}</h3>
        <p className="wg-cartao__resumo">{tipo.resumo}</p>
        <div className="wg-cartao__pe">
          <ChipDisponibilidade valor={tipo.disponibilidade} />
          <span className="wg-cartao__ver">
            Ver tipo {tipo.codigo}
            <ArrowRight className="wg-ico" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
