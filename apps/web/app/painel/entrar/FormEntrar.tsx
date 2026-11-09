'use client';

import { useActionState } from 'react';
import { Campo } from '@/componentes/Campo';
import { entrarAcao } from '../acoes';

export function FormEntrar() {
  const [estado, acao, pendente] = useActionState(entrarAcao, null);
  return (
    <form action={acao} className="flex flex-col gap-6">
      <Campo id="senha" rotulo="Senha do painel" erro={estado && !estado.ok ? estado.mensagem : undefined}>
        {(p) => <input {...p} name="senha" type="password" autoComplete="current-password" required />}
      </Campo>
      <label className="wg-marcar">
        <input type="checkbox" name="manter" defaultChecked />
        <span>Manter conectado neste celular</span>
      </label>
      <button type="submit" className="wg-btn wg-btn--largo" aria-busy={pendente} disabled={pendente}>
        {pendente ? <span className="wg-girando" aria-hidden="true" /> : null}
        {pendente ? 'Entrando…' : 'Entrar no painel'}
      </button>
    </form>
  );
}
