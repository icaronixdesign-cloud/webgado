# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Monorepo Turborepo + pnpm. `apps/web`: Next.js (App Router, TypeScript, Tailwind v4, PWA) com API REST em `/api/v1`. `packages/core` (regras de preço e status, zod), `packages/db` (Drizzle + Postgres no Supabase), `packages/tokens` (tokens de design para CSS, Tailwind e React Native). Fase 5: `apps/mobile` em Expo usando a mesma API. Demo na Vercel Hobby + Supabase Free; produção (se o cliente fechar) em Vercel Pro + Supabase Pro. Aprovado pelo usuário no plano de 2026-11-07.

## Users

Produtor de leite, muitas vezes com mais de 50 anos, comprando genética Girolando pelo celular, às vezes no curral ou na varanda, sob sol forte e com internet rural fraca. Quer escolher um tipo de embrião, ver o preço fechado e fechar com o Filipe sem pedir ajuda a ninguém.

Segundo usuário: Filipe Andrade (e talvez uma pessoa da equipe), que atualiza preços, fichas e status dos pedidos pelo próprio celular.

## Product Purpose

O Web Gado é a vitrine online de embriões Girolando da Girolando Passos, no modelo Webmotors. Mostra 5 tipos de embrião (A a E), cada um em pacotes de 12, 24, 36 e 48, e fecha a venda por dois caminhos: conversa no WhatsApp do Filipe ou pagamento online (Pix ou cartão, Mercado Pago). Todo pedido fica registrado num painel. Sucesso: o comprador conclui uma compra em até 3 passos, sozinho, e o Filipe não perde nenhuma venda.

## Positioning

Genética de um criador conhecido (perfil verificado, 73 mil seguidores, presença em Expoleite) vendida com preço fechado e público, por pacote, com economia mostrada em reais, e com o próprio Filipe acompanhando cada pedido no WhatsApp. Anúncios de embrião em classificados não mostram ficha dos pais nem preço por pacote; leilões exigem presença e lance.

## Operating Context

- O comprador lê catálogos de leilão de cor: lote, foto lateral da doadora, pai, mãe, produção em kg/dia, preço.
- Vendas hoje acontecem pelo Instagram @girolandopassos e pelo WhatsApp do Filipe (link curto de WhatsApp Business na bio). Atende "todo Brasil".
- O tipo A é real: 1/2 sangue sexado de fêmea, vaca Gir × touro Holandês, tabela 2026 de R$ 10.000 (12) a R$ 30.000 (48). Os tipos B a E são proposta, ainda não aprovados pelo Filipe.
- Desconto por volume igual em todos os tipos: 24 sai 10% mais barato por embrião que o 12, 36 cerca de 17%, 48 cerca de 25%.

## Capabilities and Constraints

- Preços, fichas, fotos, descontos e disponibilidade editáveis pelo painel, sem código.
- API pronta para um app mobile futuro (mesma API, mesmos tokens de design).
- Compra em até 3 passos: escolher tipo → escolher pacote → pagar ou ir ao WhatsApp.
- Botão flutuante "Dúvidas? Fale com o Filipe" em todas as telas.
- Linguagem do campo: "Meu pedido", "Finalizar compra"; nunca "checkout", "SKU" ou "carrinho".
- Sem pop-ups, carrosséis automáticos, contagem regressiva ou animação chamativa.
- Página inicial abaixo de 1 MB; imagens em AVIF/WebP; funciona em 3G/4G.
- WhatsApp automático só pela Cloud API oficial da Meta (fase 4), nunca por bibliotecas não oficiais.
- LGPD, SEO local ("embrião Girolando", "Passos MG"), GA4 e Pixel da Meta só após consentimento.
- Decidido: loja única (um vendedor), com o banco pronto para virar marketplace depois.
- Em aberto: o que define os tipos B a E e seus preços; o que está incluso no pacote; garantia de prenhez; frete; parcelamento; conta Mercado Pago e nota fiscal; exigências do Ministério da Agricultura e da associação da raça.

## Brand Commitments

- O nome do responsável é **Filipe** Andrade (com "i").
- Marca-mãe: Girolando Passos, logo com monograma "GP" em bronze metálico, novilha preta em silhueta e nome em capitulares romanas. O Web Gado é endossado por ela.
- O briefing fixa a direção "campo premium": fundo claro e limpo, muito espaço em branco, serifa elegante nos títulos, sem serifa bem legível no texto, cores tiradas do Instagram.
- Fotografia: só fotos reais do rebanho e da fazenda, luz natural, sem banco de imagens.
- Ícones de um único conjunto de traço simples, sempre com texto.

## Evidence on Hand

- Briefing: `Web Gado — Briefing para o Claude Code.md`.
- Instagram @girolandopassos (analisado em 2026-11-07): logo em vídeo de 2020, posts de embriões, Expoleite 2026, clientes.
- Tabela de preços 2026 do tipo A (via briefing).
- Ausentes, não inventar: logo em vetor, fotos e nomes das doadoras e touros, produção em kg/dia, depoimentos de clientes, garantia, prazos de entrega, dados legais.

## Product Principles

1. Se um produtor de 60 anos não consegue comprar sozinho, está errado.
2. Preço sempre fechado e visível: total grande, por embrião logo abaixo, economia em reais.
3. O Filipe está sempre a um toque de distância.
4. Mostrar os pais e o resultado, porque o embrião em si não se vê.
5. Todo pedido fica registrado, inclusive os que vão para o WhatsApp.

## Accessibility & Inclusion

Público mais velho: texto base de no mínimo 18 px, títulos a partir de 28 px, contraste AA da WCAG em tudo e AAA no texto corrido, botões de no mínimo 56 px sempre com texto, rótulos visíveis, navegação por teclado, leitor de tela, zoom e letra grande do celular sem quebrar.
