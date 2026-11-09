// Gera dist/theme.css (variáveis CSS + @theme do Tailwind v4) e dist/tokens.js
// (objeto com valores resolvidos, para o app em React Native) a partir de tokens.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(raiz, 'tokens.json'), 'utf8'));
const tema = t.color.themes[0].id;

const cores = new Map(t.color.tokens.map((c) => [c.name, typeof c.value === 'string' ? c.value : c.value[tema]]));
const resolver = (v, profundidade = 0) => {
  const alias = /^\{(.+)\}$/.exec(v);
  if (!alias) return v;
  if (profundidade > 16 || !cores.has(alias[1])) throw new Error(`Alias inválido: ${v}`);
  return resolver(cores.get(alias[1]), profundidade + 1);
};

const lista = (familia) => (t[familia]?.tokens ?? []).map((k) => [k.name, typeof k.value === 'string' ? k.value : k.value[tema]]);

const linhasRoot = [];
for (const [nome, valor] of cores) {
  const alias = /^\{(.+)\}$/.exec(valor);
  linhasRoot.push(`  --${nome}: ${alias ? `var(--${alias[1]})` : valor};`);
}
for (const familia of ['spacing', 'radius', 'shadow', 'alvo']) {
  for (const [nome, valor] of lista(familia)) linhasRoot.push(`  --${nome}: ${valor};`);
}
for (const [chave, pilha] of Object.entries(t.type.families)) linhasRoot.push(`  --fonte-${chave}: ${pilha};`);

// Tailwind v4: só o que vira utilitário (bg-*, text-*, rounded-*, font-*).
const linhasTheme = [];
for (const [nome] of cores) {
  const curto = nome.replace(/^wg-/, '').replace(/^cor-/, '');
  linhasTheme.push(`  --color-${curto}: var(--${nome});`);
}
for (const [nome] of lista('radius')) linhasTheme.push(`  --radius-${nome.replace(/^raio-/, '')}: var(--${nome});`);
for (const chave of Object.keys(t.type.families)) linhasTheme.push(`  --font-${chave}: var(--fonte-${chave});`);

const css = `/* Web Gado — gerado de tokens.json por packages/tokens/scripts/build.mjs. Não edite à mão. */
:root {
${linhasRoot.join('\n')}
  --raio-brinco: 14px 14px 14px 4px;
  --ease-out: cubic-bezier(.23, 1, .32, 1);
  --ease-in-out: cubic-bezier(.77, 0, .175, 1);
  --dur-toque: 140ms;
  --dur-ui: 200ms;
  --dur-folha: 240ms;
}

@theme inline {
${linhasTheme.join('\n')}
}
`;

const resolvido = {
  cor: Object.fromEntries([...cores.keys()].map((n) => [n, resolver(cores.get(n))])),
  espaco: Object.fromEntries(lista('spacing')),
  raio: Object.fromEntries(lista('radius')),
  alvo: Object.fromEntries(lista('alvo')),
  fonte: t.type.families,
  tipo: Object.fromEntries(t.type.groups.flatMap((g) => g.styles.map((s) => [s.name, { ...s, family: s.family ?? g.family }]))),
};

mkdirSync(join(raiz, 'dist'), { recursive: true });
writeFileSync(join(raiz, 'dist/theme.css'), css);
writeFileSync(join(raiz, 'dist/tokens.js'), `// Gerado de tokens.json. Não edite à mão.\nexport const tokens = ${JSON.stringify(resolvido, null, 2)};\nexport default tokens;\n`);
console.log(`tokens: ${cores.size} cores, tema "${tema}" → dist/theme.css e dist/tokens.js`);
