import { sql } from 'drizzle-orm';
import { banco } from '@webgado/db';
import { ok, falha } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Verifica se o site fala com o banco. Não expõe dados de clientes. */
export async function GET() {
  const t0 = Date.now();
  try {
    const db = await banco();
    const t1 = Date.now();
    const [info] = (await db.execute(sql`select current_user as usuario, current_setting('statement_timeout') as limite, inet_server_addr()::text as servidor`)) as unknown as Record<string, unknown>[];
    const t2 = Date.now();
    const [conta] = (await db.execute(sql`select count(*)::int as tipos from tipos`)) as unknown as Record<string, unknown>[];
    return ok({ conectarMs: t1 - t0, primeiraMs: t2 - t1, tiposMs: Date.now() - t2, ...info, ...conta });
  } catch (e) {
    return falha(500, 'banco', String((e as Error)?.cause ?? e).slice(0, 300));
  }
}
