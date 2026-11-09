import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatarReais, type CodigoTipo } from '@webgado/core';
import { listarTipos, obterTipo, vendedorPrincipal } from '@webgado/db';
import { Galeria } from '@/componentes/Galeria';
import { CompraTipo } from '@/componentes/CompraTipo';
import { FichaLote } from '@/componentes/FichaLote';
import { Aviso, ChipDisponibilidade, SeloTipo } from '@/componentes/Selos';
import { MODO_DEMO } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tipo = await obterTipo((await params).slug);
  if (!tipo) return { title: 'Tipo não encontrado' };
  return {
    title: `Tipo ${tipo.codigo} · ${tipo.nome}`,
    description: `Embrião Girolando Tipo ${tipo.codigo}, ${tipo.nome.toLowerCase()}. Pacotes de ${tipo.pacotes.map((p) => p.quantidade).join(', ')} embriões${tipo.aPartirDeCentavos ? `, a partir de ${formatarReais(tipo.aPartirDeCentavos)}` : ''}.`,
  };
}

export default async function PaginaTipo({ params }: Props) {
  const { slug } = await params;
  const [tipo, todos, vendedor] = await Promise.all([obterTipo(slug), listarTipos(), vendedorPrincipal()]);
  if (!tipo) notFound();
  const outros = todos.filter((t) => t.id !== tipo.id);

  return (
    <div className="wrap pb-16 pt-2 lg:pb-24">
      <Link href="/#tipos" className="wg-link mb-2">
        <ArrowLeft className="wg-ico" aria-hidden="true" />
        Todos os tipos
      </Link>

      <div className="tipo-grade">
        <div className="tipo-esq">
          <div className="tipo-galeria">
            <Galeria fotos={tipo.fotos} codigo={tipo.codigo} />
          </div>
          <div className="tipo-detalhes flex flex-col gap-12">
            <FichaLote tipo={tipo} />
            <section aria-labelledby="inclui-titulo" className="flex flex-col gap-3">
              <h2 id="inclui-titulo" className="t-h2">
                O que vem no pacote
              </h2>
              {tipo.oQueInclui ? (
                <p className="m-0 max-w-[40rem]">{tipo.oQueInclui}</p>
              ) : (
                <Aviso tom="info" titulo="Em definição com o Filipe.">
                  Embriões, transporte em botijão, transferência na fazenda e receptoras: o que entra aqui depende da resposta dele.
                </Aviso>
              )}
            </section>
          </div>
        </div>

        <div className="tipo-dir">
          <div className="tipo-cabeca flex flex-col items-start gap-3">
            <SeloTipo codigo={tipo.codigo} grande />
            <h1 className="t-h1">{tipo.nome}</h1>
            <p className="m-0 texto-2">{tipo.resumo}</p>
            <ChipDisponibilidade valor={tipo.disponibilidade} />
            {MODO_DEMO && tipo.statusPreco === 'proposta' ? (
              <Aviso tom="info" titulo="Preço sugerido.">
                Esta tabela é uma proposta e espera a aprovação do Filipe.
              </Aviso>
            ) : null}
          </div>
          <div className="tipo-compra">
            <CompraTipo
              codigo={tipo.codigo as CodigoTipo}
              pacotes={tipo.pacotes.map((p) => ({ quantidade: p.quantidade, precoTotalCentavos: p.precoTotalCentavos }))}
              numeroWhatsapp={vendedor.whatsappE164}
              disponivel={tipo.disponibilidade !== 'indisponivel'}
            />
          </div>
        </div>
      </div>

      {outros.length ? (
        <section aria-labelledby="outros-titulo" className="mt-16 flex flex-col gap-2 border-t border-divisor pt-12">
          <h2 id="outros-titulo" className="t-h2 mb-2">
            Outros tipos
          </h2>
          <ul className="m-0 grid list-none gap-x-8 p-0 md:grid-cols-2">
            {outros.map((t) => (
              <li key={t.id}>
                <Link href={`/embrioes/${t.slug}`} className="flex min-h-16 items-center justify-between gap-3 border-b border-divisor py-2 text-texto no-underline">
                  <span>
                    <strong className="block">
                      Tipo {t.codigo} · {t.nome}
                    </strong>
                    {t.aPartirDeCentavos ? <span className="t-pequeno texto-2 num">a partir de {formatarReais(t.aPartirDeCentavos)}</span> : null}
                  </span>
                  <ArrowRight className="wg-ico text-acao" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/comparar" className="wg-link mt-2">
            Comparar os tipos lado a lado
            <ArrowRight className="wg-ico" aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
