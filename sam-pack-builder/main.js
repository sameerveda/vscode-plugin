const Mustache = require('mustache');
const data = {
  php: [
    'brapifra.phpserver',
    'felixfbecker.php-debug',
    'felixfbecker.php-intellisense',
    'felixfbecker.php-pack',
  ],
  laravel: [
    'amiralizadeh9480.laravel-extra-intellisense',
    'codingyu.laravel-goto-view',
    'onecentlin.laravel-blade',
    'onecentlin.laravel-extension-pack',
    'onecentlin.laravel5-snippets',
    'ryannaddy.laravel-artisan',
    'stef-k.laravel-goto-controller',
  ],
  angular: [
    'alexiv.vscode-angular2-files',
    'Angular.ng-template',
    'johnpapa.angular-essentials',
    'johnpapa.Angular2',
    'Mikael.Angular-BeastCode',
    'mike-co.import-sorter',
    'hardikpthv.NgRxSnippets',
  ],
  common: [
    'shd101wyy.markdown-preview-enhanced',
    'abusaidm.html-snippets',
    'alphabotsec.vscode-eclipse-keybindings',
    'dbaeumer.vscode-eslint',
    'ecmel.vscode-html-css',
    'esbenp.prettier-vscode',
    'marclipovsky.string-manipulation',
    'PKief.material-icon-theme',
    'streetsidesoftware.code-spell-checker',
    'vincaslt.highlight-matching-tag',
    'VisualStudioExptTeam.vscodeintellicode',
    'RedVanWorkshop.explorer-exclude-vscode-extension',
    'howardzuo.vscode-favorites',
  ],
  java: [
    'naco-siren.gradle-language',
    'Pivotal.vscode-spring-boot',
    'redhat.java',
    'redhat.vscode-commons',
    'redhat.vscode-xml',
    'richardwillis.vscode-gradle-extension-pack',
    'vscjava.vscode-gradle',
    'vscjava.vscode-java-debug',
    'vscjava.vscode-java-dependency',
    'vscjava.vscode-java-pack',
    'vscjava.vscode-java-test',
    'vscjava.vscode-maven',
    'vscjava.vscode-spring-boot-dashboard',
  ],
  python: [
    'frhtylcn.pythonsnippets',
    'ms-python.python',
    'ms-python.vscode-pylance',
    'ms-toolsai.jupyter',
    'ms-toolsai.jupyter-keymap',
    'ms-toolsai.jupyter-renderers',
    'tushortz.python-extended-snippets',
  ],
  svelte: [
    'ardenivanov.svelte-intellisense',
    'fivethree.vscode-svelte-snippets',
    'svelte.svelte-vscode',
  ],
  flutter: [
    'Dart-Code.flutter',
    'Nash.awesome-flutter-snippets',
    'Dart-Code.dart-code',
  ],
  vue: ['jcbuisson.vue', 'octref.vetur'],
  'twin.macro': ['lightyen.tailwindcss-intellisense-twin'],
  peacock: ['johnpapa.vscode-peacock', 'johnpapa.winteriscoming'],
  react: ['dsznajder.es7-react-js-snippets'],
};

if (process.argv.includes('names')) {
  console.log('available names: ', Object.keys(data));
  return;
}

if (process.argv.includes('remaining')) {
  const fs = require('fs');
  const all = fs
    .readdirSync('.')
    .filter((s) => s.startsWith('all-installed-'))
    .flatMap((f) => fs.readFileSync('./' + f, 'utf-8').split(/\r?\n/))
    .map((s) => s.trim())
    .filter(Boolean);

  if (all.length === 0) {
    console.log('no all-installed found');
    return;
  }

  const recorded = new Set(Object.values(data).flatMap((d) => d));
  const slice = process.argv.slice(3);
  const filter = slice.length
    ? (t) => slice.some((s) => t.includes(s))
    : () => true;
  const remaining = new Set(
    all.filter((s) => !recorded.has(s) && filter(s.toLowerCase()))
  );

  console.log({
    all: all.length,
    recorded: recorded.size,
    remaining: remaining.size,
    for: slice.length ? slice : undefined,
  });
  console.log(remaining);

  return;
}

if (process.argv.slice(2).length === 0)
  throw new Error('no pack name specified');

const notFound = process.argv.slice(2).filter((name) => !data[name]);

if (notFound.length !== 0)
  throw new Error('pack name not found: ' + JSON.stringify(notFound));

const fs = require('fs');
const name = process.argv.slice(2).join('-');
for (const f of fs.readdirSync('./template')) {
  const content = fs
    .readFileSync('./template/' + f, 'utf-8')
    .replaceAll('<%name%>', name);

  fs.writeFileSync('./' + f, content);
  console.log('write: ', f);
}

const package = require('./package.json');
package.extensionPack = Array.from(new Set(process.argv.slice(2).flatMap(name => data[name])));

console.log('package.extensionPack.length = ', package.extensionPack.length);

fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));

const { execSync } = require('child_process');
function run_cmd(cmd) {
  console.log(cmd);
  execSync(cmd, {
    stdio: [0, 1, 2],
  });
}

run_cmd(`yarn vsce package --out dist-vsix/sam-${name}-pack.vsix`);
run_cmd(`code --uninstall-extension sameer.sam-${name}-pack`);
run_cmd(`code --install-extension dist-vsix/sam-${name}-pack.vsix`);