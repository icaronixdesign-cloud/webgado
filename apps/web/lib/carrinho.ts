'use client';

import { useSyncExternalStore } from 'react';
import type { CodigoTipo } from '@webgado/core';

/** "Meu pedido" fica guardado só neste aparelho até o comprador enviar. Um pacote por tipo. */
export interface ItemPedido {
  tipo: CodigoTipo;
  quantidade: number;
}

const CHAVE = 'webgado:pedido';
const EVENTO = 'webgado:pedido-mudou';
const VAZIO: ItemPedido[] = [];

let cacheTexto: string | null = null;
let cacheItens: ItemPedido[] = VAZIO;

function ler(): ItemPedido[] {
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(CHAVE);
  } catch {
    return VAZIO;
  }
  if (texto === cacheTexto) return cacheItens;
  cacheTexto = texto;
  try {
    const dados = texto ? JSON.parse(texto) : [];
    cacheItens = Array.isArray(dados)
      ? dados.filter((i): i is ItemPedido => typeof i?.tipo === 'string' && Number.isInteger(i?.quantidade))
      : VAZIO;
  } catch {
    cacheItens = VAZIO;
  }
  return cacheItens;
}

function gravar(itens: ItemPedido[]) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    // Sem armazenamento (aba anônima): o pedido segue só nesta tela.
    cacheTexto = JSON.stringify(itens);
    cacheItens = itens;
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function colocarNoPedido(item: ItemPedido) {
  gravar([...ler().filter((i) => i.tipo !== item.tipo), item]);
}

export function trocarPacote(tipo: CodigoTipo, quantidade: number) {
  gravar(ler().map((i) => (i.tipo === tipo ? { ...i, quantidade } : i)));
}

export function tirarDoPedido(tipo: CodigoTipo) {
  gravar(ler().filter((i) => i.tipo !== tipo));
}

export function limparPedido() {
  gravar([]);
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener('storage', aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener('storage', aviso);
  };
}

/** Os itens de "Meu pedido". No servidor (e no primeiro desenho) é sempre vazio. */
export function useMeuPedido(): ItemPedido[] {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

/** Dados do comprador guardados neste aparelho, só quando ele pede. */
const CHAVE_DADOS = 'webgado:comprador';

export interface DadosGuardados {
  nome: string;
  whatsapp: string;
  documento: string;
  cidade: string;
  uf: string;
  propriedade: string;
  email: string;
}

export function lerDadosGuardados(): DadosGuardados | null {
  try {
    const texto = window.localStorage.getItem(CHAVE_DADOS);
    return texto ? (JSON.parse(texto) as DadosGuardados) : null;
  } catch {
    return null;
  }
}

export function guardarDados(dados: DadosGuardados | null) {
  try {
    if (dados) window.localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    else window.localStorage.removeItem(CHAVE_DADOS);
  } catch {
    // sem armazenamento: nada a fazer
  }
}
