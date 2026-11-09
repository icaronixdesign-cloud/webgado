import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Login do painel da demo: uma senha (PAINEL_SENHA) e um cookie assinado (PAINEL_SEGREDO).
 * Na fase 2b vira Supabase Auth, com usuário por pessoa.
 */
const COOKIE = 'wg_painel';
const TRINTA_DIAS = 60 * 60 * 24 * 30;

export function painelConfigurado(): boolean {
  return Boolean(process.env.PAINEL_SENHA && process.env.PAINEL_SEGREDO && process.env.PAINEL_SEGREDO.length >= 32);
}

const chave = () => new TextEncoder().encode(process.env.PAINEL_SEGREDO ?? '');

export function senhaConfere(digitada: string): boolean {
  const certa = process.env.PAINEL_SENHA ?? '';
  const a = Buffer.from(digitada);
  const b = Buffer.from(certa);
  return certa.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

export async function abrirSessao(manterConectado: boolean): Promise<void> {
  const token = await new SignJWT({ papel: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('filipe')
    .setIssuedAt()
    .setExpirationTime(manterConectado ? '30d' : '12h')
    .sign(chave());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(manterConectado ? { maxAge: TRINTA_DIAS } : {}),
  });
}

export async function fecharSessao(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function usuarioDoPainel(): Promise<string | null> {
  if (!painelConfigurado()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ['HS256'] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Usar no começo de toda página e ação do painel. */
export async function exigirPainel(): Promise<string> {
  const usuario = await usuarioDoPainel();
  if (!usuario) redirect('/painel/entrar');
  return usuario;
}
