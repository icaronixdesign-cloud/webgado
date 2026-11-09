import Link from 'next/link';
import { Marca } from './Marca';
import { ContadorPedido } from './ContadorPedido';

export function Cabecalho() {
  return (
    <header className="border-b border-divisor bg-fundo">
      <div className="wrap flex min-h-[76px] items-center justify-between gap-4 py-2">
        <Marca />
        <Link href="/meu-pedido" className="wg-btn wg-btn--secundario wg-btn--medio relative whitespace-nowrap">
          Meu pedido
          <ContadorPedido />
        </Link>
      </div>
    </header>
  );
}
