import 'server-only';
import { NextResponse } from 'next/server';

/** Envelope único da API v1: { dados } ou { erro: { codigo, mensagem, campos? } }. O app mobile lê o mesmo formato. */
export function ok<T>(dados: T, status = 200) {
  return NextResponse.json({ dados }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function falha(status: number, codigo: string, mensagem: string, campos?: Record<string, string>) {
  return NextResponse.json({ erro: { codigo, mensagem, ...(campos ? { campos } : {}) } }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Limite simples por IP, em memória. Segura abuso na demo; em produção entra um limitador compartilhado. */
const janelas = new Map<string, { inicio: number; contagem: number }>();

export function dentroDoLimite(chave: string, maximo: number, janelaMs: number): boolean {
  const agora = Date.now();
  const j = janelas.get(chave);
  if (!j || agora - j.inicio > janelaMs) {
    janelas.set(chave, { inicio: agora, contagem: 1 });
    if (janelas.size > 5000) janelas.clear();
    return true;
  }
  j.contagem += 1;
  return j.contagem <= maximo;
}

export function ipDe(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
}
