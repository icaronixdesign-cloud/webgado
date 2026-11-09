import Link from 'next/link';

export default function NaoEncontrada() {
  return (
    <main className="wrap flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <h1 className="t-h1">Esta página não existe</h1>
      <p className="m-0 max-w-[32rem] texto-2">O endereço pode estar errado ou o pedido não é deste aparelho. Volte ao início e escolha de novo.</p>
      <Link href="/" className="wg-btn">
        Voltar ao início
      </Link>
    </main>
  );
}
