/** CPF, CNPJ e telefone: limpar, validar e formatar para mostrar. */

export const apenasDigitos = (texto: string) => texto.replace(/\D/g, '');

export function validarCPF(valor: string): boolean {
  const d = apenasDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (fatia: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < fatia.length; i++) soma += Number(fatia[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(d.slice(0, 9), 10) === Number(d[9]) && digito(d.slice(0, 10), 11) === Number(d[10]);
}

export function validarCNPJ(valor: string): boolean {
  const d = apenasDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calcular = (fatia: string) => {
    const pesos = fatia.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((acc, peso, i) => acc + Number(fatia[i]) * peso, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calcular(d.slice(0, 12)) === Number(d[12]) && calcular(d.slice(0, 13)) === Number(d[13]);
}

export function validarDocumento(valor: string): boolean {
  const d = apenasDigitos(valor);
  return d.length === 11 ? validarCPF(d) : d.length === 14 ? validarCNPJ(d) : false;
}

export function formatarDocumento(valor: string): string {
  const d = apenasDigitos(valor);
  if (d.length <= 11) {
    return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  }
  return d
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Esconde o meio do documento: 123.***.***-09. */
export function mascararDocumento(valor: string): string {
  const d = apenasDigitos(valor);
  if (d.length === 11) return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
  if (d.length === 14) return `${d.slice(0, 2)}.***.***/****-${d.slice(12)}`;
  return '***';
}

/**
 * Celular ou fixo brasileiro com DDD → formato internacional sem "+" (5535988442603).
 * Aceita com ou sem 55, com ou sem o 9. Devolve null quando não parece um número válido.
 */
export function normalizarTelefone(valor: string): string | null {
  let d = apenasDigitos(valor);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== '9') return null;
  return `55${d}`;
}

/** 5535988442603 → "(35) 98844-2603". */
export function formatarTelefone(e164: string): string {
  const d = apenasDigitos(e164).replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return e164;
}

/** Para a tela de confirmação: "(35) 9····-··03". */
export function mascararTelefone(e164: string): string {
  const d = apenasDigitos(e164).replace(/^55/, '');
  if (d.length < 10) return '····';
  return `(${d.slice(0, 2)}) ${d[2]}····-··${d.slice(-2)}`;
}

/** Máscara enquanto a pessoa digita o WhatsApp: (35) 98844-2603. Aceita colar com +55. */
export function mascaraTelefoneDigitando(valor: string): string {
  let d = apenasDigitos(valor);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;
export type UF = (typeof UFS)[number];
