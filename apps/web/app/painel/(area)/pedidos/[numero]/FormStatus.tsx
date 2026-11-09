'use client';

import { useActionState } from 'react';
import { Aviso } from '@/componentes/Selos';
import { Campo } from '@/componentes/Campo';
import { mudarStatusAcao } from '../../../acoes';

export function FormStatus({ numero, opcoes }: { numero: number; opcoes: { valor: string; rotulo: string }[] }) {
  const [estado, acao, pendente] = useActionState(mudarStatusAcao.bind(null, numero), null);
  return (
    <form action={acao} className="flex flex-col gap-4">
      <fieldset className="wg-pacotes">
        <legend>Novo status</legend>
        <div className="wg-pacotes__grade">
          {opcoes.map((o, i) => (
            <label key={o.valor} className="wg-pacote">
              <input type="radio" name="status" value={o.valor} defaultChecked={i === 0} />
              <span className="wg-pacote__caixa">
                <span className="wg-pacote__qtd !text-lg">{o.rotulo}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Campo id="nota" rotulo="Anotação" opcional ajuda="Só você vê. Por exemplo: pagou por transferência.">
        {(p) => <input {...p} name="nota" type="text" maxLength={200} />}
      </Campo>
      {estado ? <Aviso tom={estado.ok ? 'ok' : 'erro'} titulo={estado.mensagem} /> : null}
      <button type="submit" className="wg-btn wg-btn--largo" aria-busy={pendente} disabled={pendente}>
        {pendente ? 'Salvando…' : 'Salvar status'}
      </button>
      <p className="t-pequeno texto-2 m-0">Na fase 4, cada mudança manda uma mensagem curta para o comprador no WhatsApp.</p>
    </form>
  );
}
