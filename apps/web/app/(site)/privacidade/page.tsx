import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacidade' };

export default function Privacidade() {
  return (
    <article className="wrap pb-24 pt-8 lg:pt-12">
      <div className="flex max-w-[40rem] flex-col gap-6">
        <h1 className="t-h1">Privacidade</h1>
        <p className="t-abertura m-0">O que a Girolando Passos guarda quando você faz um pedido pelo Web Gado, e para quê.</p>

        <section className="flex flex-col gap-3">
          <h2 className="t-h3">O que guardamos</h2>
          <p className="m-0">Nome, WhatsApp, cidade e estado. Se você preencher, também CPF ou CNPJ, nome da propriedade e e-mail. E o pedido: tipo, pacote, valor e data.</p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="t-h3">Para quê</h2>
          <p className="m-0">Para o Filipe falar com você sobre o pedido, combinar pagamento e entrega e emitir a nota. É o necessário para cumprir a compra (Lei Geral de Proteção de Dados, art. 7º, V).</p>
          <p className="m-0">Ofertas no WhatsApp só se você marcar essa opção. Dá para pedir para parar a qualquer momento.</p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="t-h3">Com quem</h2>
          <p className="m-0">Seus dados ficam com a Girolando Passos. Não vendemos nem passamos para terceiros, a não ser o necessário para pagamento e entrega.</p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="t-h3">No seu celular</h2>
          <p className="m-0">&ldquo;Meu pedido&rdquo; fica guardado só no seu aparelho até você enviar. Seus dados só ficam guardados no celular se você marcar &ldquo;Guardar meus dados&rdquo;.</p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="t-h3">Ver, corrigir ou apagar</h2>
          <p className="m-0">Peça ao Filipe pelo WhatsApp. Ele responde e faz a mudança.</p>
        </section>
      </div>
    </article>
  );
}
