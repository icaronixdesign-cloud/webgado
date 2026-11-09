// Semeia os dados da demo se o banco estiver vazio.
import { banco, fecharBanco } from '../cliente';
import { semearSeVazio } from '../semente';

async function principal() {
  const db = await banco();
  const fez = await semearSeVazio(db);
  console.log(fez ? 'Dados da demo criados.' : 'O banco já tinha dados; nada foi alterado.');
  await fecharBanco();
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
