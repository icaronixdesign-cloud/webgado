import Link from 'next/link';
import { exigirPainel } from '@/lib/sessao';
import { Marca } from '@/componentes/Marca';
import { NavPainel } from './NavPainel';
import { sairAcao } from '../acoes';

export default async function LayoutArea({ children }: { children: React.ReactNode }) {
  await exigirPainel();
  return (
    <>
      <header className="border-b border-divisor">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-2">
          <Marca />
          <div className="flex items-center gap-2">
            <Link href="/" className="wg-link">
              Ver o site
            </Link>
            <form action={sairAcao}>
              <button type="submit" className="wg-btn wg-btn--neutro wg-btn--medio">
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="wrap pb-4">
          <NavPainel />
        </div>
      </header>
      <main className="wrap pb-24 pt-8">{children}</main>
    </>
  );
}
