import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { obterTipo } from '@webgado/db';
import { SeloTipo } from '@/componentes/Selos';
import { FormTipo } from './FormTipo';

export const metadata = { title: 'Editar tipo' };

export default async function EditarTipo({ params }: { params: Promise<{ codigo: string }> }) {
  const tipo = await obterTipo((await params).codigo, { incluirOcultos: true });
  if (!tipo) notFound();
  return (
    <div className="flex max-w-[40rem] flex-col gap-8">
      <Link href="/painel/tipos" className="wg-link self-start">
        <ArrowLeft className="wg-ico" aria-hidden="true" />
        Todos os tipos
      </Link>
      <div className="flex flex-col items-start gap-3">
        <SeloTipo codigo={tipo.codigo} grande />
        <h1 className="t-h1">{tipo.nome}</h1>
        <Link href={`/embrioes/${tipo.slug}`} className="wg-link">
          Ver como está no site
        </Link>
      </div>
      <FormTipo
        codigo={tipo.codigo}
        inicial={{
          nome: tipo.nome,
          resumo: tipo.resumo,
          disponibilidade: tipo.disponibilidade,
          publicado: tipo.publicado,
          grauSangue: tipo.grauSangue ?? '',
          sexado: tipo.sexado === null ? '' : tipo.sexado ? 'sim' : 'nao',
          conservacao: tipo.conservacao ?? '',
          mae: tipo.maeDescricao ?? '',
          pai: tipo.paiDescricao ?? '',
          inclui: tipo.oQueInclui ?? '',
          prazo: tipo.prazoEntregaDias?.toString() ?? '',
        }}
      />
    </div>
  );
}
