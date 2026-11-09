import { CircleX } from 'lucide-react';

/** Rótulo visível em cima, ajuda embaixo, erro escrito e ligado ao campo. */
export function Campo({
  id,
  rotulo,
  opcional,
  ajuda,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  opcional?: boolean;
  ajuda?: string;
  erro?: string;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => React.ReactNode;
}) {
  const descricoes = [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(' ');
  return (
    <div className={`wg-campo${erro ? ' wg-campo--erro' : ''}`}>
      <label htmlFor={id}>
        {rotulo} {opcional ? <span className="wg-campo__opcional">(opcional)</span> : null}
      </label>
      {children({ id, ...(descricoes ? { 'aria-describedby': descricoes } : {}), ...(erro ? { 'aria-invalid': true as const } : {}) })}
      {ajuda ? (
        <p id={`${id}-ajuda`} className="wg-campo__ajuda">
          {ajuda}
        </p>
      ) : null}
      {erro ? (
        <p id={`${id}-erro`} className="wg-campo__erro">
          <CircleX className="wg-ico" aria-hidden="true" />
          {erro}
        </p>
      ) : null}
    </div>
  );
}
