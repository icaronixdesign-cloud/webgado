'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copia um texto. Se o navegador recusar, seleciona o texto para copiar à mão. */
export function BotaoCopiar({ texto, rotulo, alvoId }: { texto: string; rotulo: string; alvoId?: string }) {
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState('');

  function selecionar() {
    const alvo = alvoId ? document.getElementById(alvoId) : null;
    if (!alvo) return;
    const faixa = document.createRange();
    faixa.selectNodeContents(alvo);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(faixa);
    setAviso('Texto selecionado. Toque e segure para copiar.');
  }

  return (
    <>
      <button
        type="button"
        className="wg-btn wg-btn--secundario wg-btn--largo"
        data-copiado={copiado ? 'true' : 'false'}
        onClick={() => {
          if (!navigator.clipboard?.writeText) return selecionar();
          navigator.clipboard.writeText(texto).then(
            () => {
              setCopiado(true);
              setAviso('Mensagem copiada.');
            },
            selecionar,
          );
        }}
      >
        {copiado ? <Check className="wg-ico" aria-hidden="true" /> : <Copy className="wg-ico" aria-hidden="true" />}
        {copiado ? 'Mensagem copiada' : rotulo}
      </button>
      <span className="wg-sr" aria-live="polite">
        {aviso}
      </span>
    </>
  );
}
