import { z } from 'zod';
import { UFS, normalizarTelefone, validarDocumento, apenasDigitos } from './documentos';
import { CANAIS } from './pedido';

export const CODIGOS_TIPO = ['A', 'B', 'C', 'D', 'E'] as const;
export type CodigoTipo = (typeof CODIGOS_TIPO)[number];

export const itemPedidoEsquema = z.object({
  tipo: z.enum(CODIGOS_TIPO, { error: 'Tipo de embrião desconhecido.' }),
  quantidade: z.number({ error: 'Escolha o pacote.' }).int().positive(),
});

const textoObrigatorio = (rotulo: string, minimo = 2) =>
  z.string({ error: `Preencha ${rotulo}.` }).trim().min(minimo, { error: `Preencha ${rotulo}.` }).max(120, { error: `${rotulo} está longo demais.` });

export const clienteEsquema = z.object({
  nome: textoObrigatorio('seu nome completo', 3).refine((v) => v.includes(' '), { error: 'Escreva nome e sobrenome.' }),
  whatsapp: z
    .string({ error: 'Preencha seu WhatsApp com DDD.' })
    .refine((v) => normalizarTelefone(v) !== null, { error: 'Confira o número: são o DDD e mais 8 ou 9 números.' })
    .transform((v) => normalizarTelefone(v) as string),
  documento: z
    .string()
    .optional()
    .transform((v) => (v ? apenasDigitos(v) : ''))
    .refine((v) => v === '' || validarDocumento(v), { error: 'Confira o CPF (11 números) ou o CNPJ (14 números).' }),
  cidade: textoObrigatorio('a cidade'),
  uf: z.enum(UFS, { error: 'Escolha o estado.' }),
  propriedade: z.string().trim().max(120).optional().default(''),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => v ?? '')
    .refine((v) => v === '' || z.email().safeParse(v).success, { error: 'Confira o e-mail: falta o @ ou o final.' }),
  aceitaOfertas: z.boolean().optional().default(false),
});

export const pedidoEntradaEsquema = z
  .object({
    canal: z.enum(CANAIS),
    itens: z.array(itemPedidoEsquema).min(1, { error: 'Seu pedido está vazio.' }).max(5),
    cliente: clienteEsquema,
  })
  .superRefine((p, ctx) => {
    if (p.canal === 'online') {
      if (!p.cliente.documento) ctx.addIssue({ code: 'custom', path: ['cliente', 'documento'], message: 'Para pagar na hora, preencha o CPF ou CNPJ.' });
      if (!p.cliente.email) ctx.addIssue({ code: 'custom', path: ['cliente', 'email'], message: 'Para pagar com Pix, o Mercado Pago pede um e-mail.' });
    }
  });

export type PedidoEntrada = z.infer<typeof pedidoEntradaEsquema>;
export type ClienteEntrada = z.infer<typeof clienteEsquema>;

/** Erros do zod viram { "cliente.nome": "Preencha seu nome completo." } para mostrar embaixo de cada campo. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const chave = issue.path.join('.');
    if (!saida[chave]) saida[chave] = issue.message;
  }
  return saida;
}
