import { listarTipos } from '@webgado/db';
import { ok } from '@/lib/api';
import { tipoPublico } from '@/lib/tipoPublico';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tipos = await listarTipos();
  return ok(tipos.map(tipoPublico));
}
