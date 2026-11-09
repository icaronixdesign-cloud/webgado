import Link from 'next/link';

/** Conjunto da marca. O monograma GP entra aqui quando o vetor chegar; até lá, o símbolo do Web Gado. */
export function Marca({ naFaixa = false }: { naFaixa?: boolean }) {
  return (
    <Link href="/" className={`wg-marca${naFaixa ? ' wg-marca--faixa' : ''}`} aria-label="Web Gado, da Girolando Passos. Ir para o início">
      <span className="wg-simbolo" aria-hidden="true">
        WG
      </span>
      <span>
        <span className="wg-marca__nome">Web Gado</span>
        <span className="wg-marca__assina">da Girolando Passos</span>
      </span>
    </Link>
  );
}
