'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TileBrinco } from './Selos';

interface Foto {
  url: string;
  alt: string;
}

/** Galeria manual: nunca troca sozinha, sempre com botões escritos e "Foto 1 de 3". */
export function Galeria({ fotos, codigo }: { fotos: Foto[]; codigo: string }) {
  const [atual, setAtual] = useState(0);
  const foto = fotos[atual];
  return (
    <section aria-label={`Fotos do Tipo ${codigo}`} className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-fundo-2">
        {foto ? (
          <Image key={foto.url} src={foto.url} alt={foto.alt} fill priority={atual === 0} sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
        ) : (
          <TileBrinco codigo={codigo} />
        )}
      </div>
      {fotos.length > 1 ? (
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <button type="button" className="wg-btn wg-btn--neutro wg-btn--medio" onClick={() => setAtual((i) => (i - 1 + fotos.length) % fotos.length)}>
            <ArrowLeft className="wg-ico" aria-hidden="true" />
            Anterior
          </button>
          <p className="t-pequeno texto-2 m-0 text-center num" aria-live="polite">
            Foto {atual + 1} de {fotos.length}
          </p>
          <button type="button" className="wg-btn wg-btn--neutro wg-btn--medio" onClick={() => setAtual((i) => (i + 1) % fotos.length)}>
            Próxima
            <ArrowRight className="wg-ico" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
