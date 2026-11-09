'use client';

import { usePathname } from 'next/navigation';
import { linkWhatsApp, mensagemDuvida } from '@webgado/core';
import { IconeWhatsApp } from './IconeWhatsApp';

/** "Dúvidas? Fale com o Filipe", fixo em todas as telas. Na página de um tipo, a mensagem já diz qual. */
export function BotaoWhatsApp({ numero }: { numero: string }) {
  const caminho = usePathname();
  const tipo = /^\/embrioes\/tipo-([a-e])$/i.exec(caminho ?? '')?.[1]?.toUpperCase();
  return (
    <a className="wg-whats wg-whats--fixo" href={linkWhatsApp(numero, mensagemDuvida(tipo))} target="_blank" rel="noopener noreferrer">
      <IconeWhatsApp />
      <span className="wg-whats__longo">Dúvidas? Fale com o Filipe</span>
      <span className="wg-whats__curto">Fale com o Filipe</span>
    </a>
  );
}
