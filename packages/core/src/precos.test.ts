import { describe, expect, it } from 'vitest';
import { aPartirDe, aplicarDescontosPadrao, conferirTabela, descontoPercentual, economia, precoPorEmbriao } from './precos';
import { formatarReais, lerReais } from './dinheiro';

const tipoA = [
  { quantidade: 12, precoTotalCentavos: 1_000_000 },
  { quantidade: 24, precoTotalCentavos: 1_800_000 },
  { quantidade: 36, precoTotalCentavos: 2_500_000 },
  { quantidade: 48, precoTotalCentavos: 3_000_000 },
];

describe('preço por embrião', () => {
  it('bate com a tabela do briefing (tipo A)', () => {
    expect(tipoA.map((p) => precoPorEmbriao(p) / 100)).toEqual([833, 750, 694, 625]);
  });
});

describe('economia', () => {
  it('é R$ 10.000 no pacote de 48 do tipo A', () => {
    expect(economia(tipoA[3]!, tipoA)).toBe(1_000_000);
  });
  it('é R$ 2.000 no de 24 e zero no de 12', () => {
    expect(economia(tipoA[1]!, tipoA)).toBe(200_000);
    expect(economia(tipoA[0]!, tipoA)).toBe(0);
  });
  it('nunca é negativa', () => {
    const caro = [...tipoA.slice(0, 1), { quantidade: 24, precoTotalCentavos: 2_500_000 }];
    expect(economia(caro[1]!, caro)).toBe(0);
  });
  it('segue o desconto padrão (10%, ~17%, 25%)', () => {
    expect(descontoPercentual(tipoA[1]!, tipoA)).toBeCloseTo(0.1, 3);
    expect(descontoPercentual(tipoA[2]!, tipoA)).toBeCloseTo(1 / 6, 3);
    expect(descontoPercentual(tipoA[3]!, tipoA)).toBeCloseTo(0.25, 3);
  });
});

describe('a partir de', () => {
  it('é o menor total entre os pacotes ativos', () => {
    expect(aPartirDe(tipoA)).toBe(1_000_000);
    expect(aPartirDe([{ ...tipoA[0]!, ativo: false }, tipoA[1]!])).toBe(1_800_000);
    expect(aPartirDe([])).toBeUndefined();
  });
});

describe('descontos padrão', () => {
  it('reproduz a tabela do tipo A a partir do pacote de 12', () => {
    expect(aplicarDescontosPadrao(1_000_000).map((p) => p.precoTotalCentavos)).toEqual([1_000_000, 1_800_000, 2_500_000, 3_000_000]);
  });
});

describe('conferir tabela', () => {
  it('não reclama de uma tabela coerente', () => {
    expect(conferirTabela(tipoA)).toEqual([]);
  });
  it('avisa quando o pacote maior sai mais caro por embrião', () => {
    const errada = [tipoA[0]!, { quantidade: 24, precoTotalCentavos: 2_200_000 }];
    expect(conferirTabela(errada)[0]?.mensagem).toContain('pacote de 24');
  });
  it('avisa pacote sem preço', () => {
    expect(conferirTabela([{ quantidade: 12, precoTotalCentavos: 0 }])[0]?.mensagem).toContain('sem preço');
  });
});

describe('dinheiro', () => {
  it('formata sem centavos quando redondo', () => {
    expect(formatarReais(1_800_000)).toBe('R$ 18.000');
    expect(formatarReais(1850)).toBe('R$ 18,50');
  });
  it('lê o que o Filipe digita', () => {
    expect(lerReais('18.000')).toBe(1_800_000);
    expect(lerReais('R$ 18.000,00')).toBe(1_800_000);
    expect(lerReais('18000')).toBe(1_800_000);
    expect(lerReais('18,5')).toBe(1850);
    expect(lerReais('abc')).toBeNull();
    expect(lerReais('')).toBeNull();
  });
});
