'use client';

import { useActionState } from 'react';
import { DISPONIBILIDADES, ROTULO_DISPONIBILIDADE } from '@webgado/core';
import { Campo } from '@/componentes/Campo';
import { Aviso } from '@/componentes/Selos';
import { salvarTipoAcao } from '../../../acoes';

interface Inicial {
  nome: string;
  resumo: string;
  disponibilidade: string;
  publicado: boolean;
  grauSangue: string;
  sexado: string;
  conservacao: string;
  mae: string;
  pai: string;
  inclui: string;
  prazo: string;
}

export function FormTipo({ codigo, inicial }: { codigo: string; inicial: Inicial }) {
  const [estado, acao, pendente] = useActionState(salvarTipoAcao.bind(null, codigo), null);
  return (
    <form action={acao} className="flex flex-col gap-6">
      <Campo id="nome" rotulo="Nome do tipo" ajuda="Aparece em letra grande no site. Exemplo: 1/2 sangue sexado de fêmea.">
        {(p) => <input {...p} name="nome" type="text" defaultValue={inicial.nome} maxLength={80} required />}
      </Campo>
      <Campo id="resumo" rotulo="Resumo em uma linha">
        {(p) => <input {...p} name="resumo" type="text" defaultValue={inicial.resumo} maxLength={120} required />}
      </Campo>

      <fieldset className="wg-pacotes">
        <legend>Disponibilidade</legend>
        <div className="wg-pacotes__grade">
          {DISPONIBILIDADES.map((d) => (
            <label key={d} className="wg-pacote">
              <input type="radio" name="disponibilidade" value={d} defaultChecked={inicial.disponibilidade === d} />
              <span className="wg-pacote__caixa">
                <span className="wg-pacote__qtd !text-lg">{ROTULO_DISPONIBILIDADE[d]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="wg-marcar">
        <input type="checkbox" name="publicado" defaultChecked={inicial.publicado} />
        <span>Mostrar este tipo no site</span>
      </label>

      <h2 className="t-h2 mt-4">Ficha</h2>
      <Campo id="grauSangue" rotulo="Grau de sangue" opcional ajuda="Só a fração: 1/2, 3/4, 5/8 ou 7/8.">
        {(p) => <input {...p} name="grauSangue" type="text" defaultValue={inicial.grauSangue} maxLength={10} />}
      </Campo>
      <Campo id="sexado" rotulo="Sexado">
        {(p) => (
          <select {...p} name="sexado" defaultValue={inicial.sexado}>
            <option value="">A confirmar</option>
            <option value="sim">Sim, para fêmea</option>
            <option value="nao">Não</option>
          </select>
        )}
      </Campo>
      <Campo id="mae" rotulo="Mãe (doadora)" opcional ajuda="Raça, nome e registro. Exemplo: Vaca Gir leiteiro.">
        {(p) => <input {...p} name="mae" type="text" defaultValue={inicial.mae} maxLength={120} />}
      </Campo>
      <Campo id="pai" rotulo="Pai (touro)" opcional>
        {(p) => <input {...p} name="pai" type="text" defaultValue={inicial.pai} maxLength={120} />}
      </Campo>
      <Campo id="conservacao" rotulo="Conservação">
        {(p) => (
          <select {...p} name="conservacao" defaultValue={inicial.conservacao}>
            <option value="">A confirmar</option>
            <option value="congelado">Congelado</option>
            <option value="fresco">Fresco</option>
            <option value="ambos">Fresco ou congelado</option>
          </select>
        )}
      </Campo>
      <Campo id="inclui" rotulo="O que vem no pacote" opcional ajuda="Embrião, botijão, transferência, receptoras: escreva como explicaria ao comprador.">
        {(p) => <textarea {...p} name="inclui" defaultValue={inicial.inclui} maxLength={600} />}
      </Campo>
      <Campo id="prazo" rotulo="Prazo de entrega, em dias" opcional>
        {(p) => <input {...p} name="prazo" type="text" inputMode="numeric" defaultValue={inicial.prazo} maxLength={3} />}
      </Campo>

      {estado ? <Aviso tom={estado.ok ? 'ok' : 'erro'} titulo={estado.mensagem} /> : null}
      <button type="submit" className="wg-btn wg-btn--largo md:w-auto md:self-start" aria-busy={pendente} disabled={pendente}>
        {pendente ? 'Salvando…' : `Salvar Tipo ${codigo}`}
      </button>
    </form>
  );
}
