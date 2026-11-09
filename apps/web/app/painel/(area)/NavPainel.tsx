'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITENS = [
  { href: '/painel', rotulo: 'Resumo' },
  { href: '/painel/pedidos', rotulo: 'Pedidos' },
  { href: '/painel/precos', rotulo: 'Preços' },
  { href: '/painel/tipos', rotulo: 'Tipos' },
];

export function NavPainel() {
  const caminho = usePathname();
  return (
    <nav aria-label="Painel" className="painel-nav">
      {ITENS.map((i) => {
        const ativo = i.href === '/painel' ? caminho === '/painel' : caminho?.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={ativo ? 'page' : undefined}>
            {i.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
