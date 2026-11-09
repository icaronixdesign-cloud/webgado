'use client';

import { useActionState } from 'react';
import { Campo } from '@/componentes/Campo';
import { Aviso } from '@/componentes/Selos';
import { salvarWhatsappAcao } from '../acoes';

export function FormWhatsapp({ atual }: { atual: string }) {
  const [estado, acao, pendente] = useActionState(salvarWhatsappAcao, null);
  return (
    <form action={acao} className="flex flex-col gap-4">
      <Campo id="whatsapp-pedidos" rotulo="Trocar o número" erro={estado && !estado.ok ? estado.mensagem : undefined}>
        {(p) => <input {...p} name="whatsapp" type="tel" inputMode="tel" defaultValue={atual} />}
      </Campo>
      {estado?.ok ? <Aviso tom="ok" titulo={estado.mensagem} /> : null}
      <button type="submit" className="wg-btn wg-btn--secundario" aria-busy={pendente} disabled={pendente}>
        {pendente ? 'Salvando…' : 'Salvar número'}
      </button>
    </form>
  );
}
