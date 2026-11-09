'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  UFS,
  formatarDocumento,
  formatarReais,
  mascaraTelefoneDigitando,
  precoPorEmbriao,
  type CodigoTipo,
} from '@webgado/core';
import { guardarDados, lerDadosGuardados, limparPedido, tirarDoPedido, trocarPacote, useMeuPedido } from '@/lib/carrinho';
import { Campo } from './Campo';
import { Passos } from './Passos';
import { Aviso, SeloTipo, TileBrinco } from './Selos';
import { IconeWhatsApp } from './IconeWhatsApp';

export interface TipoParaPedido {
  codigo: string;
  nome: string;
  slug: string;
  capa: { url: string; alt: string } | null;
  pacotes: { quantidade: number; precoTotalCentavos: number }[];
}

const VAZIO = { nome: '', whatsapp: '', documento: '', cidade: '', uf: '', propriedade: '', email: '' };
type Dados = typeof VAZIO;

const ROTULO_CAMPO: Record<string, string> = {
  'cliente.nome': 'Nome completo',
  'cliente.whatsapp': 'WhatsApp',
  'cliente.documento': 'CPF ou CNPJ',
  'cliente.cidade': 'Cidade',
  'cliente.uf': 'Estado',
  'cliente.email': 'E-mail',
  itens: 'Meu pedido',
};

export function FormularioPedido({ catalogo, pagamentoOnline }: { catalogo: TipoParaPedido[]; pagamentoOnline: boolean }) {
  const router = useRouter();
  const itensGuardados = useMeuPedido();
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [ofertas, setOfertas] = useState(false);
  const [guardar, setGuardar] = useState(false);
  const [usouGuardados, setUsouGuardados] = useState(false);
  const [trocando, setTrocando] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<null | 'whatsapp' | 'online'>(null);
  const [montado, setMontado] = useState(false);
  const resumoErrosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMontado(true);
    const salvos = lerDadosGuardados();
    if (salvos) {
      setDados({ ...VAZIO, ...salvos });
      setGuardar(true);
      setUsouGuardados(true);
    }
  }, []);

  const itens = itensGuardados
    .map((i) => {
      const tipo = catalogo.find((t) => t.codigo === i.tipo);
      const pacote = tipo?.pacotes.find((p) => p.quantidade === i.quantidade);
      return tipo && pacote ? { tipo, pacote } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const total = itens.reduce((s, i) => s + i.pacote.precoTotalCentavos, 0);

  const mudar = (campo: keyof Dados) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let valor = e.target.value;
    if (campo === 'whatsapp') valor = mascaraTelefoneDigitando(valor);
    if (campo === 'documento') valor = formatarDocumento(valor);
    setDados((d) => ({ ...d, [campo]: valor }));
    if (erros[`cliente.${campo}`]) setErros(({ [`cliente.${campo}`]: _, ...resto }) => resto);
  };

  async function enviar(canal: 'whatsapp' | 'online') {
    setEnviando(canal);
    setErroGeral(null);
    try {
      const resposta = await fetch('/api/v1/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canal,
          itens: itens.map((i) => ({ tipo: i.tipo.codigo, quantidade: i.pacote.quantidade })),
          cliente: { ...dados, aceitaOfertas: ofertas },
        }),
      });
      const corpo = await resposta.json().catch(() => null);
      if (!resposta.ok) {
        if (corpo?.erro?.campos) {
          setErros(corpo.erro.campos);
          requestAnimationFrame(() => resumoErrosRef.current?.focus());
        } else {
          setErroGeral(corpo?.erro?.mensagem ?? 'Não deu para enviar agora. Tente de novo em instantes ou fale com o Filipe.');
        }
        setEnviando(null);
        return;
      }
      guardarDados(guardar ? dados : null);
      limparPedido();
      router.push(`/pedido/${corpo.dados.numero}?t=${encodeURIComponent(corpo.dados.token)}`);
    } catch {
      setErroGeral('Sem conexão com a internet. Confira o sinal e toque de novo.');
      setEnviando(null);
    }
  }

  if (!montado) {
    return (
      <div className="min-h-[60vh]">
        <h1 className="t-h1">Meu pedido</h1>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="flex max-w-[36rem] flex-col gap-6">
        <h1 className="t-h1">Meu pedido</h1>
        <Aviso tom="info" titulo="Seu pedido está vazio.">
          Escolha um tipo de embrião e um pacote para começar.
        </Aviso>
        <Link href="/#tipos" className="wg-btn wg-btn--largo md:w-auto md:self-start">
          Ver embriões
        </Link>
      </div>
    );
  }

  const listaErros = Object.entries(erros);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href="/#tipos" className="wg-link self-start">
          <ArrowLeft className="wg-ico" aria-hidden="true" />
          Continuar escolhendo
        </Link>
        <div className="max-w-[28rem]">
          <Passos atual={2} rotulos={['Escolha', 'Seus dados', pagamentoOnline ? 'Pagamento' : 'Enviar ao Filipe']} />
        </div>
      </div>

      <div className="pedido-grade">
        <section aria-labelledby="pedido-titulo" className="pedido-resumo flex flex-col gap-4">
          <h1 id="pedido-titulo" className="t-h1">
            Meu pedido
          </h1>
          {itens.map(({ tipo, pacote }) => (
            <div key={tipo.codigo} className="pedido-item">
              <div className="flex items-start gap-4">
                <div className="relative aspect-[4/3] w-24 flex-none overflow-hidden rounded-sm bg-fundo-2">
                  {tipo.capa ? <Image src={tipo.capa.url} alt="" fill sizes="96px" className="object-cover" /> : <TileBrinco codigo={tipo.codigo} />}
                </div>
                <div className="flex min-w-0 flex-col items-start gap-1">
                  <SeloTipo codigo={tipo.codigo} />
                  <p className="m-0 texto-2">{tipo.nome}</p>
                </div>
              </div>
              <p className="t-legenda m-0">Pacote de {pacote.quantidade} embriões</p>
              <p className="m-0 num">
                <strong className="text-2xl">{formatarReais(pacote.precoTotalCentavos)}</strong>{' '}
                <span className="texto-2">({formatarReais(precoPorEmbriao(pacote))} por embrião)</span>
              </p>
              {trocando === tipo.codigo ? (
                <fieldset className="wg-pacotes mt-2">
                  <legend className="!text-xl">Trocar o pacote do Tipo {tipo.codigo}</legend>
                  <div className="wg-pacotes__grade">
                    {tipo.pacotes.map((p) => (
                      <label key={p.quantidade} className="wg-pacote">
                        <input
                          type="radio"
                          name={`trocar-${tipo.codigo}`}
                          checked={p.quantidade === pacote.quantidade}
                          onChange={() => {
                            trocarPacote(tipo.codigo as CodigoTipo, p.quantidade);
                            setTrocando(null);
                          }}
                        />
                        <span className="wg-pacote__caixa">
                          <span className="wg-pacote__qtd">{p.quantidade} embriões</span>
                          <span className="wg-pacote__valor">{formatarReais(p.precoTotalCentavos)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" className="wg-btn wg-btn--secundario wg-btn--medio" aria-expanded={trocando === tipo.codigo} onClick={() => setTrocando(trocando === tipo.codigo ? null : tipo.codigo)}>
                  {trocando === tipo.codigo ? 'Manter este' : 'Trocar pacote'}
                </button>
                <button type="button" className="wg-btn wg-btn--neutro wg-btn--medio" onClick={() => tirarDoPedido(tipo.codigo as CodigoTipo)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
          <Link href="/#tipos" className="wg-link self-start">
            Adicionar outro tipo
          </Link>
          <div className="pedido-total">
            <span className="t-legenda">Total do pedido</span>
            <strong>{formatarReais(total)}</strong>
          </div>
        </section>

        <form
          className="flex flex-col gap-6"
          noValidate
          aria-labelledby="dados-titulo"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar(pagamentoOnline ? 'online' : 'whatsapp');
          }}
        >
          <div className="flex flex-col gap-1">
            <h2 id="dados-titulo" className="t-h2">
              Seus dados
            </h2>
            <p className="m-0 texto-2">Para o Filipe saber quem é você e para onde vai o pedido.</p>
          </div>

          {usouGuardados ? (
            <Aviso tom="info" titulo="Usamos os dados guardados neste celular.">
              Confira se está tudo certo.{' '}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-info underline underline-offset-4"
                onClick={() => {
                  guardarDados(null);
                  setDados(VAZIO);
                  setGuardar(false);
                  setUsouGuardados(false);
                }}
              >
                Apagar dados guardados
              </button>
            </Aviso>
          ) : null}

          {listaErros.length ? (
            <div ref={resumoErrosRef} tabIndex={-1} className="wg-aviso wg-aviso--erro" role="alert">
              <span aria-hidden="true" />
              <div>
                <strong className="block">
                  {listaErros.length === 1 ? 'Falta acertar 1 campo:' : `Falta acertar ${listaErros.length} campos:`}
                </strong>
                <ul className="m-0 mt-1 pl-5">
                  {listaErros.map(([chave, msg]) => (
                    <li key={chave}>
                      <a href={`#campo-${chave.replace('cliente.', '')}`}>{ROTULO_CAMPO[chave] ?? chave}</a>: {msg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <Campo id="campo-nome" rotulo="Nome completo" erro={erros['cliente.nome']}>
            {(p) => <input {...p} type="text" autoComplete="name" value={dados.nome} onChange={mudar('nome')} />}
          </Campo>
          <Campo id="campo-whatsapp" rotulo="Seu WhatsApp, com DDD" ajuda="É por aqui que o Filipe vai falar com você." erro={erros['cliente.whatsapp']}>
            {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(35) 99999-9999" value={dados.whatsapp} onChange={mudar('whatsapp')} />}
          </Campo>
          <Campo id="campo-documento" rotulo="CPF ou CNPJ" opcional={!pagamentoOnline} ajuda="Só os números. Serve para a nota e o pagamento." erro={erros['cliente.documento']}>
            {(p) => <input {...p} type="text" inputMode="numeric" autoComplete="off" value={dados.documento} onChange={mudar('documento')} />}
          </Campo>
          <div className="duas-colunas">
            <Campo id="campo-cidade" rotulo="Cidade" erro={erros['cliente.cidade']}>
              {(p) => <input {...p} type="text" autoComplete="address-level2" value={dados.cidade} onChange={mudar('cidade')} />}
            </Campo>
            <Campo id="campo-uf" rotulo="Estado" erro={erros['cliente.uf']}>
              {(p) => (
                <select {...p} autoComplete="address-level1" value={dados.uf} onChange={mudar('uf')}>
                  <option value="">UF</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
          </div>
          <Campo id="campo-propriedade" rotulo="Nome da propriedade" opcional>
            {(p) => <input {...p} type="text" autoComplete="off" value={dados.propriedade} onChange={mudar('propriedade')} />}
          </Campo>
          <Campo
            id="campo-email"
            rotulo="E-mail"
            opcional={!pagamentoOnline}
            ajuda={pagamentoOnline ? 'O Mercado Pago manda o comprovante por e-mail.' : undefined}
            erro={erros['cliente.email']}
          >
            {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" value={dados.email} onChange={mudar('email')} />}
          </Campo>

          <label className="wg-marcar">
            <input type="checkbox" checked={ofertas} onChange={(e) => setOfertas(e.target.checked)} />
            <span>
              Quero receber ofertas do Filipe no WhatsApp <span className="texto-2">(opcional)</span>
            </span>
          </label>
          <label className="wg-marcar">
            <input type="checkbox" checked={guardar} onChange={(e) => setGuardar(e.target.checked)} />
            <span>Guardar meus dados neste celular para a próxima compra</span>
          </label>
          <p className="t-pequeno texto-2 m-0">
            Seus dados ficam só com a Girolando Passos. <Link href="/privacidade">Ver privacidade</Link>
          </p>

          {erroGeral ? (
            <Aviso tom="erro" titulo="O pedido não foi enviado.">
              {erroGeral}
            </Aviso>
          ) : null}

          <div className="flex flex-col gap-3">
            {pagamentoOnline ? (
              <button type="submit" className="wg-btn wg-btn--largo" aria-busy={enviando === 'online'} disabled={enviando !== null}>
                {enviando === 'online' ? <span className="wg-girando" aria-hidden="true" /> : null}
                {enviando === 'online' ? 'Preparando o pagamento…' : 'Pagar agora (Pix ou cartão)'}
              </button>
            ) : null}
            <button
              type={pagamentoOnline ? 'button' : 'submit'}
              className={`wg-btn wg-btn--largo${pagamentoOnline ? ' wg-btn--secundario' : ''}`}
              aria-busy={enviando === 'whatsapp'}
              disabled={enviando !== null}
              onClick={pagamentoOnline ? () => void enviar('whatsapp') : undefined}
            >
              {enviando === 'whatsapp' ? <span className="wg-girando" aria-hidden="true" /> : <IconeWhatsApp />}
              {enviando === 'whatsapp' ? 'Gravando seu pedido…' : 'Enviar pedido pelo WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
