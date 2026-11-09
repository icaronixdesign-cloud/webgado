const ROTULOS = ['Escolha', 'Seus dados', 'Enviar ao Filipe'] as const;

/** "Passo 2 de 3 · Seus dados". O texto carrega a informação; as barras só reforçam. */
export function Passos({ atual, rotulos = ROTULOS }: { atual: 1 | 2 | 3; rotulos?: readonly string[] }) {
  return (
    <nav className="wg-passos" aria-label="Passos da compra">
      <p className="wg-passos__texto">
        Passo {atual} de 3 · {rotulos[atual - 1]}
      </p>
      <ol className="wg-passos__lista">
        {rotulos.map((r, i) => {
          const n = i + 1;
          const estado = n < atual ? 'feito' : n === atual ? 'atual' : 'porvir';
          return (
            <li key={r} data-estado={estado} aria-current={n === atual ? 'step' : undefined}>
              {r}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
