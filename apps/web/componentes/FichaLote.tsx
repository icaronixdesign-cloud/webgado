import type { TipoCatalogo } from '@webgado/db';

const CONSERVACAO = { fresco: 'Fresco', congelado: 'Congelado', ambos: 'Fresco ou congelado' } as const;

function Valor({ texto, falta }: { texto: string | null | undefined; falta: string }) {
  if (texto) return <dd>{texto}</dd>;
  return (
    <dd>
      —<small>{falta}</small>
    </dd>
  );
}

/** A ficha genética no formato de catálogo de leilão. O que falta aparece como "a confirmar", nunca inventado. */
export function FichaLote({ tipo }: { tipo: TipoCatalogo }) {
  const grau = tipo.grauSangue ? `${tipo.grauSangue} sangue${tipo.maeDescricao?.includes('Gir') && tipo.paiDescricao?.includes('Holandês') ? ' (Gir × Holandês)' : ''}` : null;
  const sexado = tipo.sexado === null ? null : tipo.sexado ? `Sim, para ${tipo.sexo === 'macho' ? 'macho' : 'fêmea'}` : 'Não';
  return (
    <section className="wg-ficha" aria-labelledby={`ficha-${tipo.codigo}`}>
      <div className="wg-ficha__cab">
        <h2 id={`ficha-${tipo.codigo}`} className="t-h3">
          Ficha do Tipo {tipo.codigo}
        </h2>
        <span>Girolando Passos</span>
      </div>
      <dl>
        <dt>Grau de sangue</dt>
        <Valor texto={grau} falta="A confirmar" />
        <dt>Sexado</dt>
        <Valor texto={sexado} falta="A confirmar" />
        <dt>Mãe (doadora)</dt>
        <Valor texto={tipo.maeDescricao} falta="Nome e registro a confirmar" />
        <dt>Produção da mãe</dt>
        <Valor texto={null} falta="kg/dia a confirmar" />
        <dt>Pai (touro)</dt>
        <Valor texto={tipo.paiDescricao} falta="Nome e registro a confirmar" />
        <dt>Conservação</dt>
        <Valor texto={tipo.conservacao ? CONSERVACAO[tipo.conservacao] : null} falta="Fresco ou congelado a confirmar" />
      </dl>
    </section>
  );
}
