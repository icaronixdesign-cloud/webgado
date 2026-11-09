import Link from 'next/link';
import { formatarTelefone } from '@webgado/core';
import type { Vendedor } from '@webgado/db';
import { Marca } from './Marca';
import { MODO_DEMO } from '@/lib/site';

export function Rodape({ vendedor }: { vendedor: Vendedor }) {
  return (
    <footer className="bg-faixa pb-28 pt-12 text-sobre-acao">
      <div className="wrap grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Marca naFaixa />
          <p className="m-0 text-bronze-300">
            {vendedor.cidade} ({vendedor.uf}) · Atende todo o Brasil
          </p>
          <p className="m-0">
            WhatsApp do Filipe: <span className="num font-semibold">{formatarTelefone(vendedor.whatsappE164)}</span>
          </p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-col">
          <Link href="/#tipos" className="flex min-h-12 items-center text-sobre-acao">
            Os 5 tipos de embrião
          </Link>
          <Link href="/comparar" className="flex min-h-12 items-center text-sobre-acao">
            Comparar os tipos
          </Link>
          <Link href="/meu-pedido" className="flex min-h-12 items-center text-sobre-acao">
            Meu pedido
          </Link>
          {vendedor.instagram ? (
            <a href={`https://www.instagram.com/${vendedor.instagram}/`} className="flex min-h-12 items-center text-sobre-acao" target="_blank" rel="noopener noreferrer">
              Instagram @{vendedor.instagram}
            </a>
          ) : null}
          <Link href="/privacidade" className="flex min-h-12 items-center text-sobre-acao">
            Privacidade
          </Link>
        </nav>
      </div>
      <div className="wrap mt-10 border-t border-[rgb(235_212_182/0.25)] pt-6">
        <p className="t-pequeno m-0 text-bronze-300">
          Fotos: @{vendedor.instagram ?? 'girolandopassos'}.{MODO_DEMO ? ' Versão de demonstração.' : ''}
        </p>
      </div>
    </footer>
  );
}
