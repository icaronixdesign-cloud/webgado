import { arredondarAoReal } from './dinheiro';

export const QUANTIDADES_PADRAO = [12, 24, 36, 48] as const;

/** Desconto por embrião em relação ao pacote de 12, igual em todos os tipos (tabela 2026 do tipo A). */
export const DESCONTOS_PADRAO: Record<number, number> = { 12: 0, 24: 0.1, 36: 1 / 6, 48: 0.25 };

export interface PacotePreco {
  quantidade: number;
  precoTotalCentavos: number;
  ativo?: boolean;
}

const ativos = (pacotes: PacotePreco[]) =>
  pacotes.filter((p) => p.ativo !== false && p.quantidade > 0).sort((a, b) => a.quantidade - b.quantidade);

/** Pacote de referência: o menor ativo. É contra ele que a economia é calculada. */
export function pacoteBase(pacotes: PacotePreco[]): PacotePreco | undefined {
  return ativos(pacotes)[0];
}

/** Preço de cada embrião, arredondado ao real (em centavos). 18.000 ÷ 24 → 750. */
export function precoPorEmbriao(pacote: PacotePreco): number {
  return arredondarAoReal(pacote.precoTotalCentavos / pacote.quantidade);
}

/** Quanto o pacote economiza, em centavos, contra comprar no preço por embrião do menor pacote. Zero quando não há economia. */
export function economia(pacote: PacotePreco, pacotes: PacotePreco[]): number {
  const base = pacoteBase(pacotes);
  if (!base || base.quantidade === pacote.quantidade) return 0;
  const cheio = (base.precoTotalCentavos / base.quantidade) * pacote.quantidade;
  const valor = arredondarAoReal(cheio - pacote.precoTotalCentavos);
  return valor > 0 ? valor : 0;
}

/** Desconto por embrião contra o menor pacote, de 0 a 1. */
export function descontoPercentual(pacote: PacotePreco, pacotes: PacotePreco[]): number {
  const base = pacoteBase(pacotes);
  if (!base) return 0;
  const unitBase = base.precoTotalCentavos / base.quantidade;
  const unit = pacote.precoTotalCentavos / pacote.quantidade;
  return unitBase > 0 ? Math.max(0, 1 - unit / unitBase) : 0;
}

/** O "a partir de" do cartão: o menor total entre os pacotes ativos. */
export function aPartirDe(pacotes: PacotePreco[]): number | undefined {
  const lista = ativos(pacotes);
  if (lista.length === 0) return undefined;
  return Math.min(...lista.map((p) => p.precoTotalCentavos));
}

/**
 * Calcula os totais pelos descontos padrão a partir do total do pacote de 12,
 * arredondados a R$ 100. O Filipe ajusta depois, se quiser.
 */
export function aplicarDescontosPadrao(totalDoze: number, quantidades: readonly number[] = QUANTIDADES_PADRAO): PacotePreco[] {
  const unit = totalDoze / 12;
  return quantidades.map((quantidade) => {
    const desconto = DESCONTOS_PADRAO[quantidade] ?? 0;
    const total = Math.round((unit * quantidade * (1 - desconto)) / 10000) * 10000;
    return { quantidade, precoTotalCentavos: quantidade === 12 ? totalDoze : total };
  });
}

export interface AvisoPreco {
  quantidade: number;
  mensagem: string;
}

/** Confere a tabela de um tipo antes de salvar. Devolve avisos em português simples. */
export function conferirTabela(pacotes: PacotePreco[]): AvisoPreco[] {
  const avisos: AvisoPreco[] = [];
  const lista = ativos(pacotes);
  for (const p of pacotes) {
    if (!Number.isInteger(p.precoTotalCentavos) || p.precoTotalCentavos <= 0) {
      avisos.push({ quantidade: p.quantidade, mensagem: `O pacote de ${p.quantidade} está sem preço.` });
    }
  }
  for (let i = 1; i < lista.length; i++) {
    const menor = lista[i - 1]!;
    const maior = lista[i]!;
    if (maior.precoTotalCentavos <= 0 || menor.precoTotalCentavos <= 0) continue;
    if (maior.precoTotalCentavos / maior.quantidade > menor.precoTotalCentavos / menor.quantidade) {
      avisos.push({
        quantidade: maior.quantidade,
        mensagem: `No pacote de ${maior.quantidade}, cada embrião sai mais caro que no de ${menor.quantidade}.`,
      });
    }
  }
  return avisos;
}
