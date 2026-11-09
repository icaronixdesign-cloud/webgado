import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type Banco = PostgresJsDatabase<typeof schema>;

/** Sobe pastas a partir de onde o processo roda até achar a raiz do monorepo (onde está o turbo.json). */
// Os caminhos aqui só servem ao banco local (PGlite) e aos scripts; o comentário evita que o
// Next inclua o projeto inteiro no pacote do servidor por causa deles.
export function raizDoProjeto(): string {
  const inicio = /*turbopackIgnore: true*/ process.cwd();
  let dir = resolve(/*turbopackIgnore: true*/ inicio);
  for (let i = 0; i < 6; i++) {
    if (existsSync(/*turbopackIgnore: true*/ join(dir, 'turbo.json'))) return dir;
    const pai = dirname(dir);
    if (pai === dir) break;
    dir = pai;
  }
  return resolve(/*turbopackIgnore: true*/ inicio);
}

export const pastaMigracoes = () => join(raizDoProjeto(), 'packages', 'db', 'drizzle');

interface Conexao {
  banco: Banco;
  modo: 'postgres' | 'pglite';
  fechar: () => Promise<void>;
}

const chave = Symbol.for('webgado.banco');
type GlobalComBanco = typeof globalThis & { [chave]?: Promise<Conexao> };

/**
 * A string do banco: DATABASE_URL (Supabase copiado à mão) ou POSTGRES_URL (criada pela integração
 * Supabase da Vercel). Sem nenhuma das duas, o site usa o banco local embutido.
 */
export function urlDoBanco(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

/** Tira da URL os parâmetros que só o painel do Supabase entende e decide o SSL. */
function prepararUrl(bruta: string): { url: string; ssl: 'require' | false | undefined } {
  const u = new URL(bruta);
  const sslmode = u.searchParams.get('sslmode');
  u.search = '';
  const ssl = sslmode === 'disable' ? false : sslmode || /supabase\.(co|com)$/.test(u.hostname) ? 'require' : undefined;
  return { url: u.toString(), ssl };
}

async function conectar(): Promise<Conexao> {
  const bruta = urlDoBanco();
  if (process.env.WEBGADO_DIAGNOSTICO) console.log('[diag] conectar:', bruta ? 'postgres' : 'pglite');
  if (bruta) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const { url, ssl } = prepararUrl(bruta);
    // prepare: false funciona com o pooler de transações do Supabase.
    // Na Vercel: uma conexão por instância, que fecha quando fica parada e não espera para sempre.
    const sql = postgres(url, {
      prepare: false,
      // Uma conexão por consulta simultânea: o pooler do Supabase trava com consultas em fila na mesma conexão.
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ...(ssl !== undefined ? { ssl } : {}),
    });
    return { banco: drizzle(sql, { schema, casing: 'snake_case' }), modo: 'postgres', fechar: () => sql.end() };
  }

  // Sem DATABASE_URL: Postgres embutido (PGlite) numa pasta local, para rodar sem instalar nada.
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const pasta = process.env.WEBGADO_DATA_DIR ?? join(raizDoProjeto(), '.data', 'pglite');
  mkdirSync(pasta, { recursive: true });
  const cliente = new PGlite(pasta);
  const banco = drizzle(cliente, { schema, casing: 'snake_case' });
  await migrate(banco, { migrationsFolder: pastaMigracoes() });
  return { banco: banco as unknown as Banco, modo: 'pglite', fechar: () => cliente.close() };
}

function conexao(): Promise<Conexao> {
  const g = globalThis as GlobalComBanco;
  if (!g[chave]) {
    g[chave] = conectar().then(async (c) => {
      if (c.modo === 'pglite') {
        // Banco local vazio: semeia os dados da demo na primeira vez.
        const { semearSeVazio } = await import('./semente');
        await semearSeVazio(c.banco);
      }
      return c;
    });
    g[chave].catch(() => {
      delete g[chave];
    });
  }
  return g[chave];
}

export async function banco(): Promise<Banco> {
  return (await conexao()).banco;
}

export async function fecharBanco(): Promise<void> {
  const g = globalThis as GlobalComBanco;
  if (!g[chave]) return;
  const c = await g[chave];
  delete g[chave];
  await c.fechar();
}
