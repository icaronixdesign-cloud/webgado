// Aplica as migrações. Com DATABASE_URL ou POSTGRES_URL (Supabase), roda no build da Vercel;
// sem elas, no banco local (PGlite).
import { banco, fecharBanco, pastaMigracoes, urlDoBanco } from '../cliente';

async function principal() {
  if (urlDoBanco()) {
    const { sql } = await import('drizzle-orm');
    const db = await banco();
    // Conexões esquecidas no meio de uma transação travam as tabelas: mostra e encerra.
    const presas = await db.execute(sql`select pid, state, wait_event_type, left(query, 80) as consulta, now() - xact_start as ha
      from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid() and (state like 'idle in transaction%' or wait_event_type = 'Lock')`);
    console.log('Conexões presas:', JSON.stringify(presas));
    await db.execute(sql`select pg_terminate_backend(pid) from pg_stat_activity
      where datname = current_database() and pid <> pg_backend_pid() and state like 'idle in transaction%'`);
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    await migrate(await banco(), { migrationsFolder: pastaMigracoes() });
    console.log('Migrações aplicadas no Postgres.');
  } else if (process.env.VERCEL) {
    throw new Error('Falta o banco: conecte o Supabase ao projeto na Vercel (aba Storage) ou defina DATABASE_URL.');
  } else {
    await banco(); // o PGlite migra ao abrir
    console.log('Migrações aplicadas no banco local (.data/pglite).');
  }
  await fecharBanco();
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
