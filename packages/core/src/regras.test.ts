import { describe, expect, it } from 'vitest';
import { formatarTelefone, mascaraTelefoneDigitando, mascararTelefone, normalizarTelefone, validarCNPJ, validarCPF, formatarDocumento } from './documentos';
import { linkWhatsApp, mensagemPedido } from './whatsapp';
import { linhaDoTempo, podeMudar } from './pedido';
import { errosPorCampo, pedidoEntradaEsquema } from './esquemas';

describe('documentos', () => {
  it('valida CPF e CNPJ', () => {
    expect(validarCPF('529.982.247-25')).toBe(true);
    expect(validarCPF('529.982.247-26')).toBe(false);
    expect(validarCPF('111.111.111-11')).toBe(false);
    expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    expect(validarCNPJ('11.222.333/0001-82')).toBe(false);
  });
  it('formata o documento', () => {
    expect(formatarDocumento('52998224725')).toBe('529.982.247-25');
    expect(formatarDocumento('11222333000181')).toBe('11.222.333/0001-81');
  });
});

describe('telefone', () => {
  it('normaliza com e sem 55', () => {
    expect(normalizarTelefone('(35) 98844-2603')).toBe('5535988442603');
    expect(normalizarTelefone('+55 35 98844 2603')).toBe('5535988442603');
    expect(normalizarTelefone('35 3521-0000')).toBe('553535210000');
  });
  it('recusa número curto ou celular sem 9', () => {
    expect(normalizarTelefone('98844-2603')).toBeNull();
    expect(normalizarTelefone('35 88844 2603')).toBeNull();
  });
  it('formata e mascara', () => {
    expect(formatarTelefone('5535988442603')).toBe('(35) 98844-2603');
    expect(mascararTelefone('5535988442603')).toBe('(35) 9····-··03');
    expect(mascaraTelefoneDigitando('35988442603')).toBe('(35) 98844-2603');
    expect(mascaraTelefoneDigitando('+55 35 98844 2603')).toBe('(35) 98844-2603');
  });
});

describe('mensagem do WhatsApp', () => {
  it('segue o texto do briefing', () => {
    const texto = mensagemPedido({
      numero: 1234,
      itens: [{ codigo: 'A', quantidade: 24, precoTotalCentavos: 1_800_000 }],
      nome: 'João da Silva',
      cidade: 'Passos',
      uf: 'MG',
    });
    expect(texto).toBe('Olá, Filipe! Vim pelo Web Gado e quero fechar este pedido: Pedido nº 1234 — Tipo A, pacote de 24 embriões — R$ 18.000. Meu nome é João da Silva, de Passos/MG.');
  });
  it('soma o total quando há mais de um tipo', () => {
    const texto = mensagemPedido({
      numero: 1001,
      itens: [
        { codigo: 'A', quantidade: 12, precoTotalCentavos: 1_000_000 },
        { codigo: 'E', quantidade: 12, precoTotalCentavos: 500_000 },
      ],
      nome: 'Ana Souza',
      cidade: 'Franca',
      uf: 'SP',
    });
    expect(texto).toContain('Total: R$ 15.000');
  });
  it('monta o link wa.me com o texto codificado', () => {
    expect(linkWhatsApp('5535988442603', 'Olá, Filipe!')).toBe('https://wa.me/5535988442603?text=Ol%C3%A1%2C%20Filipe!');
  });
});

describe('status do pedido', () => {
  it('só permite as mudanças previstas', () => {
    expect(podeMudar('em_conversa', 'pago')).toBe(true);
    expect(podeMudar('pago', 'em_conversa')).toBe(false);
    expect(podeMudar('concluido', 'cancelado')).toBe(false);
  });
  it('monta a linha do tempo do comprador', () => {
    expect(linhaDoTempo('em_preparacao').map((e) => e.estado)).toEqual(['feito', 'atual', 'porvir', 'porvir', 'porvir']);
    expect(linhaDoTempo('concluido').every((e) => e.estado === 'feito')).toBe(true);
    expect(linhaDoTempo('em_conversa').every((e) => e.estado === 'porvir')).toBe(true);
  });
});

describe('entrada do pedido', () => {
  const base = {
    canal: 'whatsapp' as const,
    itens: [{ tipo: 'A' as const, quantidade: 24 }],
    cliente: { nome: 'João da Silva', whatsapp: '(35) 98844-2603', cidade: 'Passos', uf: 'MG' as const },
  };
  it('aceita o mínimo no caminho do WhatsApp', () => {
    const r = pedidoEntradaEsquema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.cliente.whatsapp).toBe('5535988442603');
  });
  it('explica cada erro no campo certo', () => {
    const r = pedidoEntradaEsquema.safeParse({ ...base, cliente: { ...base.cliente, nome: 'João', whatsapp: '123', documento: '123' } });
    expect(r.success).toBe(false);
    if (!r.success) {
      const erros = errosPorCampo(r.error);
      expect(erros['cliente.nome']).toBe('Escreva nome e sobrenome.');
      expect(erros['cliente.whatsapp']).toContain('DDD');
      expect(erros['cliente.documento']).toContain('CPF');
    }
  });
  it('pede CPF e e-mail para pagar na hora', () => {
    const r = pedidoEntradaEsquema.safeParse({ ...base, canal: 'online' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const erros = errosPorCampo(r.error);
      expect(erros['cliente.documento']).toBeDefined();
      expect(erros['cliente.email']).toBeDefined();
    }
  });
});
