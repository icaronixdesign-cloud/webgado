// Apaga o banco LOCAL (PGlite) e recria com os dados da demo. Nunca toca num DATABASE_URL.
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { banco, fecharBanco, raizDoProjeto, urlDoBanco } from '../cliente';

async function principal() {
  if (urlDoBanco()) {
    console.error('DATABASE_URL está definida. O reset só apaga o banco local; remova a variável para continuar.');
    process.exit(1);
  }
  const pasta = process.env.WEBGADO_DATA_DIR ?? join(raizDoProjeto(), '.data', 'pglite');
  rmSync(pasta, { recursive: true, force: true });
  await banco(); // recria, migra e semeia
  await fecharBanco();
  console.log(`Banco local recriado em ${pasta}.`);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
