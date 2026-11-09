import { obterTipo } from '@webgado/db';
import { falha, ok } from '@/lib/api';
import { tipoPublico } from '@/lib/tipoPublico';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const tipo = await obterTipo((await params).codigo);
  if (!tipo) return falha(404, 'nao_encontrado', 'Tipo não encontrado.');
  return ok(tipoPublico(tipo));
}
