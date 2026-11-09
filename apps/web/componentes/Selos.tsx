import { CircleCheck, Clock, Info, TriangleAlert, CircleX } from 'lucide-react';
import { ROTULO_DISPONIBILIDADE, type Disponibilidade } from '@webgado/core';

export function SeloTipo({ codigo, grande = false }: { codigo: string; grande?: boolean }) {
  return <span className={`wg-selo${grande ? ' wg-selo--grande' : ''}`}>Tipo {codigo}</span>;
}

const VISUAL: Record<Disponibilidade, { classe: string; Icone: typeof CircleCheck }> = {
  disponivel: { classe: 'wg-chip--ok', Icone: CircleCheck },
  poucas_unidades: { classe: 'wg-chip--alerta', Icone: TriangleAlert },
  sob_encomenda: { classe: 'wg-chip--info', Icone: Clock },
  indisponivel: { classe: 'wg-chip--neutro', Icone: CircleX },
};

export function ChipDisponibilidade({ valor }: { valor: Disponibilidade }) {
  const { classe, Icone } = VISUAL[valor];
  return (
    <span className={`wg-chip ${classe}`}>
      <Icone className="wg-ico" aria-hidden="true" strokeWidth={2.25} />
      {ROTULO_DISPONIBILIDADE[valor]}
    </span>
  );
}

/** O selo grande no lugar da foto, enquanto não chegam fotos dos pais do tipo. */
export function TileBrinco({ codigo }: { codigo: string }) {
  return (
    <div className="wg-tile" role="img" aria-label={`Selo do Tipo ${codigo}. Fotos dos pais em breve`}>
      <span className="wg-tile__brinco" aria-hidden="true">
        <span>{codigo}</span>
      </span>
    </div>
  );
}

export function Aviso({ tom, titulo, children, papel }: { tom: 'ok' | 'alerta' | 'erro' | 'info'; titulo: string; children?: React.ReactNode; papel?: 'alert' | 'status' | 'note' }) {
  const Icone = tom === 'ok' ? CircleCheck : tom === 'alerta' ? TriangleAlert : tom === 'erro' ? CircleX : Info;
  return (
    <div className={`wg-aviso wg-aviso--${tom}`} role={papel ?? (tom === 'erro' ? 'alert' : tom === 'ok' ? 'status' : 'note')}>
      <Icone className="wg-ico" aria-hidden="true" strokeWidth={2.25} />
      <p>
        <strong>{titulo}</strong>
        {children}
      </p>
    </div>
  );
}
