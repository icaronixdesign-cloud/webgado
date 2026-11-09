# Web Gado — Briefing para o Claude Code

Nov 7, 2026 · @Icaronix

## Visão geral

O Web Gado é uma vitrine online de embriões bovinos da raça Girolando, no estilo Webmotors, feita para a Girolando Passos (Felipe). O site divulga os embriões e fecha a venda por dois caminhos: conversa no WhatsApp do Felipe ou pagamento online pelo Mercado Pago (cartão ou Pix).

| Item | Definição |
| --- | --- |
| Nome do produto | Web Gado |
| Cliente | Girolando Passos — responsável comercial: Felipe |
| Referência visual | [Instagram @girolandopassos](https://www.instagram.com/girolandopassos/) |
| O que se vende | Embriões em 5 tipos (A, B, C, D, E), cada um em pacotes de 12, 24, 36 e 48 embriões |
| Plataforma agora | Site responsivo, pensado primeiro para o celular |
| Plataforma depois | App mobile (Android e iOS) usando a mesma API e o mesmo design system |
| Objetivo | Vender com o mínimo de atrito, com o Felipe acompanhando cada pedido pessoalmente |

## Público e usabilidade

O comprador típico é produtor de leite, muitas vezes acima dos 50 anos, que acessa pelo celular e às vezes com internet rural fraca. Toda decisão de interface deve passar no teste: "meu pai consegue comprar sozinho, sem pedir ajuda?"

Regras obrigatórias:

- **Letra grande:** texto base de no mínimo 18 px, títulos a partir de 28 px; contraste nível AA da WCAG (AAA no texto corrido).
- **Botões grandes e escritos:** altura mínima de 56 px, sempre com texto ("Comprar", "Falar com o Felipe"), nunca só um ícone.
- **Compra em até 3 passos:** escolher tipo → escolher pacote → pagar ou ir ao WhatsApp.
- **WhatsApp sempre à mão:** botão flutuante fixo em todas as telas, com o texto "Dúvidas? Fale com o Felipe".
- **Preço sem conta:** mostrar o valor total do pacote em destaque e o valor por embrião logo abaixo, menor.
- **Linguagem do campo:** nada de "checkout", "SKU" ou "carrinho de compras" sem explicação; usar "Meu pedido", "Finalizar compra".
- **Sem distrações:** nada de pop-ups, carrosséis automáticos, contagem regressiva ou animações chamativas.
- **Leve e rápido:** imagens em WebP/AVIF, página inicial abaixo de 1 MB, carregando bem em 3G/4G.
- **Confirmações claras:** cada ação importante mostra uma tela grande dizendo o que aconteceu e o que vem a seguir.
- **Acessível:** campos com rótulo visível, navegação por teclado, compatível com leitor de tela e com o zoom do celular.

## Catálogo e preços

São 20 produtos: 5 tipos × 4 pacotes (12, 24, 36 e 48 embriões). O tipo A segue a tabela real da Girolando Passos para 2026, de R$ 10.000 a R$ 30.000; os tipos B a E são proposta, de 85% a 50% do preço do A. Todos os preços devem ser editáveis pelo Felipe num painel, sem mexer em código.

**Tipos (A é real; B a E são proposta para o Felipe confirmar):**

| Tipo | O que é | Preço por embrião (pacote de 12) |
| --- | --- | --- |
| A | Pacote completo: 1/2 sangue sexado de fêmea, vaca Gir × touro Holandês (tabela real) | R$ 833 |
| B | Proposta: genética de destaque, sexado de fêmea | R$ 708 |
| C | Proposta: boa genética leiteira | R$ 583 |
| D | Proposta: custo-benefício para aumentar o rebanho | R$ 500 |
| E | Proposta: entrada, para quem está começando | R$ 417 |

Cada tipo deve ter ficha com: grau de sangue (1/2, 3/4, 5/8), sexado fêmea ou não, pai (touro), mãe e produção de leite dela (kg/dia), fresco ou congelado, fotos dos pais e um vídeo curto opcional.

**Desconto por volume (igual em todos os tipos, seguindo o A):** comparado ao preço por embrião do pacote de 12, o de 24 sai 10% mais barato, o de 36 cerca de 17% e o de 48, 25%. No site, mostrar a economia em reais, por exemplo "economize R$ 10.000" no pacote de 48 do tipo A.

**Tabela de preços (total do pacote, e por embrião entre parênteses):**

| Tipo | 12 embriões | 24 embriões | 36 embriões | 48 embriões |
| --- | --- | --- | --- | --- |
| A | R$ 10.000 (833) | R$ 18.000 (750) | R$ 25.000 (694) | R$ 30.000 (625) |
| B | R$ 8.500 (708) | R$ 15.500 (646) | R$ 21.500 (597) | R$ 25.500 (531) |
| C | R$ 7.000 (583) | R$ 13.000 (542) | R$ 18.000 (500) | R$ 21.500 (448) |
| D | R$ 6.000 (500) | R$ 11.000 (458) | R$ 15.000 (417) | R$ 18.000 (375) |
| E | R$ 5.000 (417) | R$ 9.000 (375) | R$ 12.500 (347) | R$ 15.000 (313) |

Fonte do tipo A: tabela de preços 2026 da Girolando Passos, enviada pelo Felipe. Para conferir a faixa de mercado: um técnico citado pela [CNA/Senar Minas](https://cnabrasil.org.br/noticias/produtores-colhem-primeiros-resultados-com-fiv) estimou R$ 700 a R$ 900 por embrião FIV no particular (2022), e há anúncios de embriões Girolando a R$ 1.000 a unidade no [MF Rural](https://www.mfrural.com.br/busca/girolando-gir/categoria/38-animais).

## Fluxos de compra

De "Meu pedido" o cliente escolhe entre falar com o Felipe ou pagar na hora; nos dois caminhos a conversa termina no WhatsApp do Felipe, e todo pedido fica registrado no painel.

&#91;embedded content: fluxo de compra · 2 caminhos, 1 decisão de pagamento\]

Se o pagamento não for aprovado, a tela oferece "Tentar de novo" e "Falar com o Felipe no WhatsApp". Pix pendente fica como "Aguardando pagamento" até o Mercado Pago confirmar, e o QR Code expira depois de um prazo definido (sugestão: 30 minutos).

**Mensagem pronta do caminho WhatsApp** (o cliente envia):

> Olá, Felipe! Vim pelo Web Gado e quero fechar este pedido: Pedido nº 1234 — Tipo A, pacote de 24 embriões — R$ 18.000. Meu nome é \_\_\_, de \_**/**.

**Mensagem automática após o pagamento** (o número do Felipe envia, via template aprovado pela Meta):

> Olá, \[nome\]! Aqui é o Felipe, da Girolando Passos. Recebi o pagamento do seu pedido nº \[número\] (\[tipo\], \[quantidade\] embriões). Vou acompanhar seu pedido do início ao fim e estou à disposição para qualquer dúvida. É só responder esta mensagem.

Cada mudança de status no painel (em preparação, envio agendado, entregue) dispara uma mensagem curta no mesmo padrão.

## Páginas e funcionalidades

O site tem 9 telas públicas e um painel simples para o Felipe administrar preços e pedidos pelo celular.

**Telas públicas**

| Tela | O que tem |
| --- | --- |
| Início | Chamada principal com botão "Ver embriões"; 5 cartões de tipo (A a E) com "a partir de R$"; "Como funciona" em 3 passos; quem é a Girolando Passos e o Felipe |
| Página do tipo | Ficha genética, fotos dos pais, seletor de pacote com 4 botões grandes (12/24/36/48), preço total + preço por embrião, botões "Comprar agora" e "Tirar dúvida no WhatsApp" |
| Comparar tipos | Os 5 tipos lado a lado, para quem está em dúvida entre um e outro |
| Meu pedido | Itens escolhidos, trocar pacote, remover, total; dois botões: "Pagar agora (Pix ou cartão)" e "Enviar pedido pelo WhatsApp" |
| Dados do comprador | Nome, WhatsApp, CPF/CNPJ, cidade/UF e propriedade; e-mail opcional; o mínimo de campos possível |
| Pagamento | Mercado Pago com Pix (QR Code + copia e cola) e cartão |
| Pedido confirmado | Número do pedido em letra grande e o aviso "O Felipe vai falar com você no WhatsApp" |
| Acompanhar pedido | Busca por número do pedido + telefone; linha do tempo: Pago → Em preparação → Envio agendado → Entregue → Concluído |
| Ajuda e institucional | Perguntas frequentes (transferência, receptoras, prazos, transporte), sobre, contato, termos, privacidade (LGPD) e garantia |

**Painel do Felipe**

- Editar tipos, fichas, fotos, preços e descontos por pacote.
- Marcar disponibilidade por tipo: disponível, poucas unidades ou sob encomenda.
- Lista de pedidos com filtros; ao mudar o status, o cliente recebe aviso no WhatsApp.
- Registro dos pedidos enviados pelo WhatsApp, com status "em conversa", para não perder nenhuma venda.
- Resumo do mês: vendas por tipo, total faturado, pedidos pendentes.
- Tudo usável no celular, com o mesmo padrão de letra grande e botões grandes.

## Identidade visual

Antes de qualquer tela, o Claude Code deve analisar o [Instagram @girolandopassos](https://www.instagram.com/girolandopassos/) e entregar um Style Guide e uma Typography que traduzam a marca para um visual refinado e moderno. As cores e o estilo vêm do perfil, não de suposições.

**Como analisar:** abrir o perfil no navegador e observar logo, cores recorrentes, tipo de foto, legendas e destaques. O Instagram costuma bloquear acesso automatizado sem login; se isso acontecer, pedir ao Felipe o arquivo do logo e 10 a 15 prints do feed e dos destaques.

**Entregáveis do Style Guide:**

1. Paleta: cor primária, secundária, acento, neutros (fundo, texto, bordas) e cores de estado (sucesso, alerta, erro), cada uma com hex e contraste verificado.
2. Tipografia: uma fonte para títulos e uma para texto (Google Fonts), com escala de tamanhos a partir de 18 px de base, pesos e altura de linha.
3. Logo do Web Gado: proposta de logotipo e regras de uso ao lado da marca Girolando Passos.
4. Fotografia: diretriz para fotos reais do rebanho e da fazenda, luz natural, sem banco de imagens genérico.
5. Ícones: um único conjunto de traço simples, sempre acompanhado de texto.
6. Componentes: botão principal e secundário, cartão de tipo, selo do tipo (A a E), seletor de pacote, botão flutuante do WhatsApp, campo de formulário, linha do tempo do pedido.
7. Tom de voz: direto, respeitoso, linguagem do campo; exemplos de frases certas e erradas.
8. Tokens prontos para código: variáveis CSS e configuração do Tailwind, para reaproveitar no app depois.

Direção de referência, a confirmar com o que o Instagram mostrar: "campo premium" — fundo claro e limpo, muito espaço em branco, uma fonte serifada elegante nos títulos e uma sem serifa bem legível no texto.

## Arquitetura técnica

Recomendação: um site Next.js com banco Postgres, pagamento pelo Mercado Pago e WhatsApp pela API oficial da Meta, com uma API própria desde o início para o app mobile reaproveitar depois. O Claude Code pode propor alternativas, justificando.

| Camada | Sugestão | Por quê |
| --- | --- | --- |
| Site | Next.js + TypeScript + Tailwind, como PWA | Rápido, bom para SEO, instalável no celular antes do app existir |
| Banco de dados | Postgres (Supabase ou Neon) | Tipos, pacotes, preços, pedidos e clientes em tabelas simples |
| Painel do Felipe | Área logada no próprio site | Um só sistema para manter |
| Pagamento | Mercado Pago (Checkout Pro ou Bricks) com Pix e cartão | Muito usado no Brasil, parcela no cartão; o webhook do Mercado Pago confirma o pagamento |
| WhatsApp manual | Link wa.me com a mensagem do pedido já escrita | Não precisa de API; funciona no dia 1 |
| WhatsApp automático | WhatsApp Business Platform (Cloud API da Meta) | Única forma oficial de mandar mensagem sozinho depois do pagamento |
| Hospedagem | Vercel | Deploy simples e gratuito no começo |
| App futuro | React Native com Expo, usando a mesma API e os mesmos tokens de design | Reaproveita regras, preços e visual |

**Atenção ao WhatsApp automático:**

- O link wa.me só abre a conversa com o texto pronto; quem envia é o cliente. Ele não consegue mandar mensagem sozinho em nome do Felipe.
- Para a mensagem automática "vou acompanhar seu pedido do início ao fim", é preciso a Cloud API da Meta (direto ou por um provedor brasileiro), com empresa verificada no Gerenciador de Negócios da Meta.
- Mensagens que a empresa inicia precisam de modelo (template) aprovado pela Meta e têm custo por mensagem.
- Com o recurso de coexistência da Meta, o mesmo número pode continuar no app WhatsApp Business do celular do Felipe e na API ao mesmo tempo; exige app WhatsApp Business versão 2.24.17 ou superior ([Kommo](https://www.kommo.com/br/blog/whatsapp-coexistence/)). O número precisa ser WhatsApp Business, não o pessoal.
- Evitar bibliotecas não oficiais que simulam o WhatsApp Web: o número pode ser banido.

**Outros requisitos:** LGPD (aviso de privacidade e consentimento), SEO local ("embrião Girolando", "Passos MG"), Google Analytics 4 e Pixel da Meta, backups do banco e registro de todo pedido, inclusive os que forem para o WhatsApp.

## Pontos em aberto

Estas respostas do Felipe mudam o que será construído; as quatro primeiras travam o início do desenvolvimento.

- [ ] **Web Gado é só da Girolando Passos ou vai abrir para outros vendedores, como o Webmotors?** Muda a arquitetura (loja única ou marketplace com vários vendedores).
- [ ] **O que define os tipos B a E? (o A já é o 1/2 sangue sexado de fêmea)** Grau de sangue, sexado ou não, produção da mãe, touro usado.
- [ ] **Preços dos tipos B a E** aprovados, ou ajustes na tabela; e se ficam 4 pacotes ou entra um 5º (por exemplo, 60 embriões).
- [ ] **O que está incluso no pacote:** só o embrião congelado, ou também transporte em botijão, transferência na fazenda e receptoras?
- [ ] Existe garantia de prenhez ou reposição de embrião?
- [ ] Quantidade disponível por tipo, ou tudo sob encomenda? Qual o prazo de entrega?
- [ ] Região atendida e quem paga o frete.
- [ ] Cartão: até quantas parcelas, com ou sem juros? Desconto no Pix?
- [ ] Felipe tem conta Mercado Pago com CNPJ e emite nota fiscal?
- [ ] Qual número de WhatsApp será usado, e ele já é WhatsApp Business?
- [ ] Domínio desejado (por exemplo, webgado.com.br) e se já existe logo do Web Gado.
- [ ] Fotos e vídeos reais dos animais, doadoras e touros.
- [ ] Exigências do Ministério da Agricultura e da associação da raça (registro genealógico) para a venda de embriões.

## Fases e prompt para o Claude Code

A entrega vai em 5 fases; a fase 1 já coloca o site no ar vendendo pelo WhatsApp, sem depender de API nem de aprovação da Meta.

1. **Descoberta:** Style Guide e Typography a partir do Instagram; respostas aos pontos em aberto; mapa de telas.
2. **Vitrine + WhatsApp (MVP):** início, páginas dos tipos, comparador, "Meu pedido" e envio pelo link wa.me; painel para editar tipos e preços.
3. **Pagamento online:** Mercado Pago com Pix e cartão, webhook, tela de confirmação, painel de pedidos e acompanhamento.
4. **WhatsApp automático:** Cloud API da Meta com templates aprovados; mensagem após o pagamento e a cada mudança de status; aviso de novo pedido para o Felipe.
5. **App mobile:** Expo/React Native usando a mesma API e os mesmos tokens de design.

**Prompt inicial (copiar e colar no Claude Code, junto com este documento):**

```text
Você vai planejar o Web Gado, um site no estilo Webmotors para venda de embriões
Girolando da Girolando Passos (responsável: Felipe). Leia o briefing anexo inteiro.

Antes de escrever código:
1. Analise o Instagram https://www.instagram.com/girolandopassos/ e entregue um
   Style Guide e uma Typography (paleta com hex e contraste, fontes, escala de
   tamanhos com base 18 px, componentes, tom de voz e tokens em CSS/Tailwind).
   Se não conseguir acessar o perfil, me peça prints e o logo.
2. Monte a estratégia: arquitetura, modelo de dados (tipos, pacotes, preços,
   pedidos, clientes, status), mapa de telas, fluxos de compra (WhatsApp e
   Mercado Pago com Pix/cartão) e o plano das 5 fases.
3. Liste as dúvidas que bloqueiam cada fase.

Regras que não mudam: público mais velho (letra grande, botões grandes com texto,
compra em até 3 passos, WhatsApp sempre visível), design refinado e moderno,
preços editáveis pelo painel, API pronta para um app mobile futuro.
Não comece a programar até eu aprovar a estratégia.
```
