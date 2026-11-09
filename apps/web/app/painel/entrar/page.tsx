import { redirect } from 'next/navigation';
import { Marca } from '@/componentes/Marca';
import { Aviso } from '@/componentes/Selos';
import { painelConfigurado, usuarioDoPainel } from '@/lib/sessao';
import { FormEntrar } from './FormEntrar';

export const metadata = { title: 'Entrar' };

export default async function Entrar() {
  if (await usuarioDoPainel()) redirect('/painel');
  return (
    <main className="wrap flex min-h-dvh flex-col justify-center gap-8 py-12">
      <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-8">
        <Marca />
        <div className="flex flex-col gap-2">
          <h1 className="t-h1">Painel do Filipe</h1>
          <p className="m-0 texto-2">Preços, tipos e pedidos do Web Gado.</p>
        </div>
        {painelConfigurado() ? (
          <FormEntrar />
        ) : (
          <Aviso tom="alerta" titulo="O painel ainda não tem senha.">
            Defina PAINEL_SENHA e PAINEL_SEGREDO (32 caracteres ou mais) nas variáveis do site.
          </Aviso>
        )}
      </div>
    </main>
  );
}
