import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatarReais, linkWhatsApp, mensagemDuvida } from '@webgado/core';
import { listarTipos, vendedorPrincipal } from '@webgado/db';
import { CartaoTipo } from '@/componentes/CartaoTipo';
import { IconeWhatsApp } from '@/componentes/IconeWhatsApp';

export default async function Inicio() {
  const [tipos, vendedor] = await Promise.all([listarTipos(), vendedorPrincipal()]);
  const tipoA = tipos.find((t) => t.codigo === 'A');
  const [destaque, ...outros] = tipos;

  return (
    <>
      <section aria-labelledby="inicio-titulo" className="inicio-hero">
        <div className="inicio-hero__foto">
          <Image src="/fotos/bezerras-pasto.jpg" alt="Bezerras Gir malhadas no pasto da Girolando Passos" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="inicio-hero__texto" data-enter>
          <h1 id="inicio-titulo" className="t-display">
            Embriões Girolando para quem vive do leite
          </h1>
          <p className="t-abertura texto-2 m-0">Escolha o tipo, escolha o pacote e feche com o Filipe pelo WhatsApp.</p>
          {tipoA?.aPartirDeCentavos ? (
            <p className="m-0 font-semibold text-bronze-800">
              Tipo A, {tipoA.nome}: a partir de <span className="num">{formatarReais(tipoA.aPartirDeCentavos)}</span>
            </p>
          ) : null}
          <Link href="#tipos" className="wg-btn wg-btn--largo md:w-auto md:self-start">
            Ver embriões
          </Link>
        </div>
      </section>

      <section id="tipos" aria-labelledby="tipos-titulo" className="border-t border-divisor py-16 lg:py-24">
        <div className="wrap flex flex-col gap-6">
          <div className="flex max-w-[44rem] flex-col gap-2">
            <h2 id="tipos-titulo" className="t-h2">
              Os {tipos.length} tipos de embrião
            </h2>
            <p className="m-0 texto-2">Do mais completo ao de entrada. Toque num tipo para ver a ficha e os pacotes de 12, 24, 36 e 48 embriões.</p>
          </div>
          <div className="inicio-tipos">
            {destaque ? <CartaoTipo tipo={destaque} destaque /> : null}
            {outros.map((t) => (
              <CartaoTipo key={t.id} tipo={t} />
            ))}
          </div>
          <Link href="/comparar" className="wg-btn wg-btn--secundario wg-btn--largo md:w-auto md:self-start">
            Comparar os {tipos.length} tipos
          </Link>
        </div>
      </section>

      <section aria-labelledby="como-titulo" className="bg-fundo-2 py-16 lg:py-24">
        <div className="wrap flex flex-col gap-8">
          <h2 id="como-titulo" className="t-h2">
            Como funciona
          </h2>
          <ol className="inicio-passos">
            <li>
              <span className="inicio-passos__n" aria-hidden="true">
                1
              </span>
              <div>
                <p className="t-legenda m-0">Escolha o tipo</p>
                <p className="m-0 mt-1 texto-2">Compare os tipos e veja a ficha dos pais de cada um.</p>
              </div>
            </li>
            <li>
              <span className="inicio-passos__n" aria-hidden="true">
                2
              </span>
              <div>
                <p className="t-legenda m-0">Escolha o pacote</p>
                <p className="m-0 mt-1 texto-2">12, 24, 36 ou 48 embriões. Quanto maior o pacote, menor o preço de cada embrião.</p>
              </div>
            </li>
            <li>
              <span className="inicio-passos__n" aria-hidden="true">
                3
              </span>
              <div>
                <p className="t-legenda m-0">Feche com o Filipe</p>
                <p className="m-0 mt-1 texto-2">Seu pedido vai pronto para o WhatsApp dele. O Filipe acompanha até a entrega.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="quem-titulo" className="py-16 lg:py-24">
        <div className="wrap inicio-quem">
          <div className="relative aspect-[6/5] overflow-hidden rounded-md bg-fundo-2">
            <Image src="/fotos/filipe-andrade.jpg" alt="Filipe Andrade, de chapéu, na varanda da fazenda" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
          </div>
          <div className="flex max-w-[36rem] flex-col gap-4">
            <h2 id="quem-titulo" className="t-h2">
              O Filipe e a Girolando Passos
            </h2>
            <p className="m-0">
              A Girolando Passos trabalha com genética Girolando, FIV e seleção em {vendedor.cidade} ({vendedor.uf}), e vende embriões para todo o Brasil. O Filipe Andrade acompanha cada pedido pessoalmente, do primeiro contato até a entrega.
            </p>
            <p className="m-0 texto-2">73 mil pessoas acompanham o trabalho dele no Instagram.</p>
            {vendedor.instagram ? (
              <a className="wg-link self-start" href={`https://www.instagram.com/${vendedor.instagram}/`} target="_blank" rel="noopener noreferrer">
                Ver o Instagram @{vendedor.instagram}
                <ArrowRight className="wg-ico" aria-hidden="true" />
              </a>
            ) : null}
            <a className="wg-btn wg-btn--secundario wg-btn--largo mt-2 md:w-auto md:self-start" href={linkWhatsApp(vendedor.whatsappE164, mensagemDuvida())} target="_blank" rel="noopener noreferrer">
              <IconeWhatsApp />
              Conversar com o Filipe
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
