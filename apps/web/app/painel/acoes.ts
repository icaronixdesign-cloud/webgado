'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DISPONIBILIDADES, STATUS_PEDIDO, lerReais, normalizarTelefone, type Disponibilidade, type StatusPedido, type AvisoPreco } from '@webgado/core';
import { ErroPedido, atualizarTipo, atualizarWhatsappVendedor, mudarStatus, salvarPrecos } from '@webgado/db';
import { abrirSessao, exigirPainel, fecharSessao, painelConfigurado, senhaConfere } from '@/lib/sessao';
import { dentroDoLimite } from '@/lib/api';

export interface Resultado {
  ok: boolean;
  mensagem: string;
  avisos?: AvisoPreco[];
}

export async function entrarAcao(_antes: Resultado | null, form: FormData): Promise<Resultado> {
  if (!painelConfigurado()) return { ok: false, mensagem: 'O painel ainda não tem senha configurada.' };
  if (!dentroDoLimite('painel-login', 20, 10 * 60_000)) return { ok: false, mensagem: 'Muitas tentativas. Espere alguns minutos.' };
  const senha = String(form.get('senha') ?? '');
  if (!senhaConfere(senha)) return { ok: false, mensagem: 'Senha errada. Confira e tente de novo.' };
  await abrirSessao(form.get('manter') === 'on');
  redirect('/painel');
}

export async function sairAcao(): Promise<void> {
  await fecharSessao();
  redirect('/painel/entrar');
}

export async function salvarPrecosAcao(codigo: string, valores: { quantidade: number; texto: string; ativo: boolean }[], aprovar: boolean): Promise<Resultado> {
  const usuario = await exigirPainel();
  const novos = [];
  for (const v of valores) {
    const centavos = lerReais(v.texto);
    if (centavos === null || centavos <= 0) return { ok: false, mensagem: `Confira o preço do pacote de ${v.quantidade}: escreva só o valor, como 18.000.` };
    novos.push({ quantidade: v.quantidade, precoTotalCentavos: centavos, ativo: v.ativo });
  }
  if (!novos.some((n) => n.ativo)) return { ok: false, mensagem: 'Deixe pelo menos um pacote à venda.' };
  const { avisos } = await salvarPrecos(codigo, novos, usuario, aprovar);
  revalidatePath('/', 'layout');
  return {
    ok: true,
    mensagem: avisos.length ? `Preços do Tipo ${codigo} salvos, mas confira o aviso abaixo.` : `Preços do Tipo ${codigo} salvos. O site já mostra os valores novos.`,
    avisos,
  };
}

const texto = (form: FormData, campo: string) => {
  const v = String(form.get(campo) ?? '').trim();
  return v.length ? v : null;
};

export async function salvarTipoAcao(codigo: string, _antes: Resultado | null, form: FormData): Promise<Resultado> {
  await exigirPainel();
  const nome = texto(form, 'nome');
  const resumo = texto(form, 'resumo');
  if (!nome || !resumo) return { ok: false, mensagem: 'Preencha o nome e o resumo do tipo.' };
  const disponibilidade = String(form.get('disponibilidade')) as Disponibilidade;
  if (!DISPONIBILIDADES.includes(disponibilidade)) return { ok: false, mensagem: 'Escolha a disponibilidade.' };
  const sexado = form.get('sexado');
  const conservacao = form.get('conservacao');
  const prazo = texto(form, 'prazo');
  await atualizarTipo(codigo, {
    nome,
    resumo,
    disponibilidade,
    publicado: form.get('publicado') === 'on',
    grauSangue: texto(form, 'grauSangue'),
    sexado: sexado === 'sim' ? true : sexado === 'nao' ? false : null,
    conservacao: conservacao === 'fresco' || conservacao === 'congelado' || conservacao === 'ambos' ? conservacao : null,
    maeDescricao: texto(form, 'mae'),
    paiDescricao: texto(form, 'pai'),
    oQueInclui: texto(form, 'inclui'),
    prazoEntregaDias: prazo && /^\d{1,3}$/.test(prazo) ? Number(prazo) : null,
  });
  revalidatePath('/', 'layout');
  return { ok: true, mensagem: `Tipo ${codigo} salvo. O site já mostra as mudanças.` };
}

export async function mudarStatusAcao(numero: number, _antes: Resultado | null, form: FormData): Promise<Resultado> {
  const usuario = await exigirPainel();
  const para = String(form.get('status')) as StatusPedido;
  if (!STATUS_PEDIDO.includes(para)) return { ok: false, mensagem: 'Escolha o novo status.' };
  try {
    await mudarStatus(numero, para, usuario, texto(form, 'nota') ?? undefined);
  } catch (e) {
    if (e instanceof ErroPedido) return { ok: false, mensagem: e.message };
    throw e;
  }
  revalidatePath(`/painel/pedidos/${numero}`);
  revalidatePath('/painel');
  return { ok: true, mensagem: 'Status atualizado.' };
}

export async function salvarWhatsappAcao(_antes: Resultado | null, form: FormData): Promise<Resultado> {
  await exigirPainel();
  const numero = normalizarTelefone(String(form.get('whatsapp') ?? ''));
  if (!numero) return { ok: false, mensagem: 'Confira o número: DDD e mais 8 ou 9 números.' };
  await atualizarWhatsappVendedor(numero);
  revalidatePath('/', 'layout');
  return { ok: true, mensagem: 'Número salvo. Os pedidos novos já vão para ele.' };
}
