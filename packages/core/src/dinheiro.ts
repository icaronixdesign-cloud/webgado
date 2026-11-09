/** Todo valor em dinheiro anda em centavos (inteiro). Só vira texto na hora de mostrar. */

const inteiro = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const comCentavos = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1800000 → "R$ 18.000"; 1850 → "R$ 18,50". Sem centavos quando o valor é redondo. */
export function formatarReais(centavos: number): string {
  const reais = centavos / 100;
  const texto = Number.isInteger(reais) ? inteiro.format(reais) : comCentavos.format(reais);
  return `R$ ${texto}`;
}

/** Arredonda centavos para o real inteiro mais próximo (ainda em centavos). */
export function arredondarAoReal(centavos: number): number {
  return Math.round(centavos / 100) * 100;
}

/** Lê um valor digitado no painel ("18.000", "18000", "18.000,00", "R$ 18 000") e devolve centavos, ou null. */
export function lerReais(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, '').trim();
  if (!limpo) return null;
  let normal = limpo;
  if (/,\d{1,2}$/.test(normal)) {
    normal = normal.replace(/\./g, '').replace(',', '.');
  } else {
    normal = normal.replace(/[.,]/g, '');
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return null;
  const valor = Math.round(Number(normal) * 100);
  return Number.isFinite(valor) ? valor : null;
}
