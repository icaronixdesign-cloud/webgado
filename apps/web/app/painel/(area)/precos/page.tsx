import { listarTipos } from '@webgado/db';
import { FormPrecos } from './FormPrecos';

export const metadata = { title: 'Preços' };

export default async function Precos() {
  const tipos = await listarTipos({ incluirOcultos: true });
  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-[40rem] flex-col gap-2">
        <h1 className="t-h1">Preços</h1>
        <p className="m-0 texto-2">Escreva o total de cada pacote. O preço por embrião e a economia são calculados sozinhos e aparecem no site assim que você salvar.</p>
      </div>
      {tipos.map((t) => (
        <FormPrecos
          key={t.id}
          codigo={t.codigo}
          nome={t.nome}
          aprovado={t.statusPreco === 'aprovado'}
          pacotes={t.pacotes.map((p) => ({ quantidade: p.quantidade, precoTotalCentavos: p.precoTotalCentavos, ativo: p.ativo }))}
        />
      ))}
    </div>
  );
}
