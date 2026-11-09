import { vendedorPrincipal } from '@webgado/db';
import { Cabecalho } from '@/componentes/Cabecalho';
import { Rodape } from '@/componentes/Rodape';
import { BotaoWhatsApp } from '@/componentes/BotaoWhatsApp';

export const dynamic = 'force-dynamic';

export default async function LayoutSite({ children }: { children: React.ReactNode }) {
  const vendedor = await vendedorPrincipal();
  return (
    <>
      <a href="#conteudo" className="wg-pular">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Rodape vendedor={vendedor} />
      <BotaoWhatsApp numero={vendedor.whatsappE164} />
    </>
  );
}
