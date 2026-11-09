# Web Gado

Vitrine de embriões Girolando da Girolando Passos (Filipe Andrade). Fase 2a: a demo para o Filipe, com a compra fechando pelo WhatsApp.

## Rodar no computador

Precisa de Node 22 ou mais novo. Não precisa instalar banco: sem `DATABASE_URL`, o site usa um Postgres embutido (PGlite) na pasta `.data/pglite`, já com os 5 tipos e os preços.

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:3000. O painel fica em http://localhost:3000/painel; a senha local está em `apps/web/.env.local` (`PAINEL_SENHA`). Para começar de novo com o banco limpo, pare o servidor e rode `npm run db:reset`.

## O que tem

| Pasta | O quê |
| --- | --- |
| `apps/web` | Site em Next.js: Início, página de cada tipo, Comparar, Meu pedido, pedido pronto para o WhatsApp, Privacidade e o painel do Filipe (resumo, pedidos, preços, tipos) |
| `apps/web/app/api/v1` | API que o app mobile vai usar: `GET /tipos`, `GET /tipos/{codigo}`, `POST /pedidos`, `GET /pedidos/{token}` |
| `packages/core` | Regras: preço por embrião, economia, mensagem do WhatsApp, CPF/CNPJ, telefone, status do pedido. `npm test` roda os testes |
| `packages/db` | Banco: esquema (Drizzle), migrações em `drizzle/`, dados iniciais e consultas |
| `packages/tokens` | Cores, tipos e medidas do Style Guide. `npm run tokens` gera o CSS e o objeto para o app |

## Publicar a demo (Vercel grátis + Supabase grátis)

O projeto `webgado` já existe na Vercel (raiz `apps/web`, região São Paulo, com `WEBGADO_DEMO`, `PAINEL_SENHA` e `PAINEL_SEGREDO`). A senha do painel publicado está em `.env.producao.local`.

1. Conecte o banco: no projeto da Vercel, aba **Storage**, crie um banco **Supabase** e ligue ao projeto (Production e Preview). Isso cria `POSTGRES_URL` sozinho. Se preferir criar o Supabase no site dele, cole a string do pooler de transações (porta 6543, com a senha) como `DATABASE_URL` em Settings › Environment Variables.
2. Entre na CLI da Vercel uma vez: `npx vercel login`.
3. Publique da raiz do projeto:
   ```bash
   npx vercel link --yes --project webgado
   ```
   ```bash
   npx vercel deploy --prod
   ```
   O build (`vercel-build`) aplica as migrações e cria os dados da demo se o banco estiver vazio.
4. O Supabase grátis pausa depois de 7 dias sem uso. Antes de mandar o link para o Filipe, abra o site uma vez.

A Vercel grátis não permite uso comercial: antes de vender de verdade, passe para o plano Pro.

## Pendências desta fase

- Fotos: as da demo são do Instagram @girolandopassos, pequenas (até 361 px de largura). Precisam das originais.
- Preços de B a E e as disponibilidades são proposta até o Filipe aprovar.
- Logo GP em vetor; até lá, o cabeçalho usa o símbolo do Web Gado.
- O painel tem uma senha só. Na fase 2b vira login por pessoa (Supabase Auth) e ganha envio de fotos.
