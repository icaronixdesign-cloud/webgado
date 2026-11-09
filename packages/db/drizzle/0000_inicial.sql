CREATE TYPE "public"."canal" AS ENUM('whatsapp', 'online');--> statement-breakpoint
CREATE TYPE "public"."categoria" AS ENUM('embriao', 'novilha', 'vaca', 'touro', 'semen');--> statement-breakpoint
CREATE TYPE "public"."conservacao" AS ENUM('fresco', 'congelado', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."disponibilidade" AS ENUM('disponivel', 'poucas_unidades', 'sob_encomenda', 'indisponivel');--> statement-breakpoint
CREATE TYPE "public"."papel_animal" AS ENUM('doadora', 'touro');--> statement-breakpoint
CREATE TYPE "public"."status_pedido" AS ENUM('em_conversa', 'aguardando_pagamento', 'pagamento_recusado', 'expirado', 'pago', 'em_preparacao', 'envio_agendado', 'entregue', 'concluido', 'perdido', 'cancelado', 'reembolsado');--> statement-breakpoint
CREATE TYPE "public"."status_preco" AS ENUM('aprovado', 'proposta');--> statement-breakpoint
CREATE TABLE "animais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendedor_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"papel" "papel_animal" NOT NULL,
	"raca" text NOT NULL,
	"grau_sangue" text,
	"registro_abcg" text,
	"producao_leite_kg_dia" real,
	"observacoes" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"whatsapp_e_164" text NOT NULL,
	"documento" text,
	"tipo_pessoa" text,
	"cidade" text NOT NULL,
	"uf" text NOT NULL,
	"propriedade" text,
	"email" text,
	"aceita_ofertas" boolean DEFAULT false NOT NULL,
	"consentimento_em" timestamp with time zone,
	"origem" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_whatsappE164_unique" UNIQUE("whatsapp_e_164")
);
--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" jsonb NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos_pedido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"de_status" "status_pedido",
	"para_status" "status_pedido" NOT NULL,
	"por" text NOT NULL,
	"nota" text,
	"em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historico_precos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pacote_id" uuid NOT NULL,
	"preco_antes" integer NOT NULL,
	"preco_depois" integer NOT NULL,
	"por_usuario" text NOT NULL,
	"em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itens_pedido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"tipo_id" uuid NOT NULL,
	"pacote_id" uuid,
	"codigo_tipo" text NOT NULL,
	"quantidade_embrioes" integer NOT NULL,
	"preco_total_centavos" integer NOT NULL,
	"descricao" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensagens_whatsapp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid,
	"cliente_id" uuid,
	"direcao" text NOT NULL,
	"template" text,
	"wamid" text,
	"status_envio" text NOT NULL,
	"erro" text,
	"em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "midias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo_id" uuid,
	"animal_id" uuid,
	"tipo" text DEFAULT 'foto' NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"largura" integer,
	"altura" integer,
	"ordem" integer DEFAULT 0 NOT NULL,
	"credito" text
);
--> statement-breakpoint
CREATE TABLE "pacotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo_id" uuid NOT NULL,
	"quantidade" integer NOT NULL,
	"preco_total_centavos" integer NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"metodo" text NOT NULL,
	"mp_payment_id" text,
	"status" text NOT NULL,
	"valor_centavos" integer NOT NULL,
	"parcelas" integer,
	"pix_copia_cola" text,
	"pix_qr" text,
	"expira_em" timestamp with time zone,
	"motivo_recusa" text,
	"payload" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pagamentos_mpPaymentId_unique" UNIQUE("mp_payment_id")
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "pedidos_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"token" text NOT NULL,
	"vendedor_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"canal" "canal" NOT NULL,
	"status" "status_pedido" NOT NULL,
	"total_centavos" integer NOT NULL,
	"observacao" text,
	"origem" jsonb,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_numero_unique" UNIQUE("numero"),
	CONSTRAINT "pedidos_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tipos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendedor_id" uuid NOT NULL,
	"categoria" "categoria" DEFAULT 'embriao' NOT NULL,
	"codigo" text NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"resumo" text NOT NULL,
	"descricao" text,
	"grau_sangue" text,
	"sexado" boolean,
	"sexo" text,
	"conservacao" "conservacao",
	"mae_id" uuid,
	"pai_id" uuid,
	"mae_descricao" text,
	"pai_descricao" text,
	"disponibilidade" "disponibilidade" DEFAULT 'disponivel' NOT NULL,
	"prazo_entrega_dias" integer,
	"o_que_inclui" text,
	"video_url" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"publicado" boolean DEFAULT true NOT NULL,
	"status_preco" "status_preco" DEFAULT 'proposta' NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tipos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendedores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"whatsapp_e_164" text NOT NULL,
	"cidade" text NOT NULL,
	"uf" text NOT NULL,
	"documento" text,
	"instagram" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendedores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "webhooks_recebidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origem" text NOT NULL,
	"evento_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processado_em" timestamp with time zone,
	"recebido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhooks_recebidos_eventoId_unique" UNIQUE("evento_id")
);
--> statement-breakpoint
ALTER TABLE "animais" ADD CONSTRAINT "animais_vendedor_id_vendedores_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."vendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_pedido" ADD CONSTRAINT "eventos_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_precos" ADD CONSTRAINT "historico_precos_pacote_id_pacotes_id_fk" FOREIGN KEY ("pacote_id") REFERENCES "public"."pacotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_tipo_id_tipos_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pacote_id_pacotes_id_fk" FOREIGN KEY ("pacote_id") REFERENCES "public"."pacotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens_whatsapp" ADD CONSTRAINT "mensagens_whatsapp_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens_whatsapp" ADD CONSTRAINT "mensagens_whatsapp_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midias" ADD CONSTRAINT "midias_tipo_id_tipos_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midias" ADD CONSTRAINT "midias_animal_id_animais_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animais"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pacotes" ADD CONSTRAINT "pacotes_tipo_id_tipos_id_fk" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedor_id_vendedores_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."vendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipos" ADD CONSTRAINT "tipos_vendedor_id_vendedores_id_fk" FOREIGN KEY ("vendedor_id") REFERENCES "public"."vendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipos" ADD CONSTRAINT "tipos_mae_id_animais_id_fk" FOREIGN KEY ("mae_id") REFERENCES "public"."animais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipos" ADD CONSTRAINT "tipos_pai_id_animais_id_fk" FOREIGN KEY ("pai_id") REFERENCES "public"."animais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pacotes_tipo_quantidade" ON "pacotes" USING btree ("tipo_id","quantidade");--> statement-breakpoint
CREATE INDEX "pedidos_status" ON "pedidos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pedidos_criado_em" ON "pedidos" USING btree ("criado_em");--> statement-breakpoint
CREATE UNIQUE INDEX "tipos_vendedor_codigo" ON "tipos" USING btree ("vendedor_id","codigo");