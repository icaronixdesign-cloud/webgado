// Teste de fumaça do banco: roda num banco descartável (WEBGADO_DATA_DIR) e confere catálogo, pedido e painel.
import { pedidoEntradaEsquema, mensagemPedido, formatarReais } from '@webgado/core';
import { listarTipos, criarPedido, obterPedidoPorToken, mudarStatus, resumoDoMes, salvarPrecos, fecharBanco } from '../index';

async function principal() {
  if (!process.env.WEBGADO_DATA_DIR || process.env.DATABASE_URL) {
    throw new Error('Rode só com WEBGADO_DATA_DIR apontando para uma pasta descartável e sem DATABASE_URL.');
  }
  const tipos = await listarTipos();
  for (const t of tipos) {
    console.log(`${t.codigo} ${t.nome} · a partir de ${formatarReais(t.aPartirDeCentavos ?? 0)} · ${t.pacotes.length} pacotes · ${t.fotos.length} fotos · ${t.disponibilidade}`);
  }
  const entrada = pedidoEntradaEsquema.parse({
    canal: 'whatsapp',
    itens: [{ tipo: 'A', quantidade: 24 }],
    cliente: { nome: 'Teste da Silva', whatsapp: '(35) 99999-0000', cidade: 'Passos', uf: 'MG' },
  });
  const p = await criarPedido(entrada);
  console.log('pedido', p.numero, formatarReais(p.totalCentavos));
  console.log(mensagemPedido({ numero: p.numero, itens: p.itens, ...p.cliente }));
  await mudarStatus(p.numero, 'pago', 'teste');
  const d = await obterPedidoPorToken(p.token);
  console.log('status', d?.status, '· eventos', d?.eventos.length);
  console.log('resumo', JSON.stringify(await resumoDoMes()));
  const r = await salvarPrecos('B', [
    { quantidade: 12, precoTotalCentavos: 850_000, ativo: true },
    { quantidade: 24, precoTotalCentavos: 1_750_000, ativo: true },
  ], 'teste', false);
  console.log('avisos ao salvar', JSON.stringify(r.avisos));
  await fecharBanco();
}

principal().catch(async (e) => {
  console.error(e);
  await fecharBanco();
  process.exit(1);
});
