import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listarTipos } from '@webgado/db';
import { ChipDisponibilidade, SeloTipo } from '@/componentes/Selos';

export const metadata = { title: 'Tipos' };

export default async function Tipos() {
  const tipos = await listarTipos({ incluirOcultos: true });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-[40rem] flex-col gap-2">
        <h1 className="t-h1">Tipos de embrião</h1>
        <p className="m-0 texto-2">Nome, ficha dos pais, disponibilidade e o que vem no pacote. Fotos entram na próxima versão do painel.</p>
      </div>
      <div className="flex flex-col">
        {tipos.map((t) => (
          <Link key={t.id} href={`/painel/tipos/${t.codigo.toLowerCase()}`} className="painel-linha">
            <span className="flex flex-wrap items-center gap-3">
              <SeloTipo codigo={t.codigo} />
              <strong>{t.nome}</strong>
              {!t.publicado ? <span className="wg-chip wg-chip--neutro">Fora do site</span> : null}
            </span>
            <span className="flex items-center gap-3">
              <ChipDisponibilidade valor={t.disponibilidade} />
              <ArrowRight className="wg-ico text-acao" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
