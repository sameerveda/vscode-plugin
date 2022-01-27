import {
  statSync,
  readdirSync,
  existsSync,
  writeFileSync,
  unlinkSync,
} from 'fs';
import { dirname, join } from 'path';
import { workspace } from 'vscode';
const minimatch = require('minimatch');

export function create_index_file(uri) {
  const excluder_patterns =
    workspace.getConfiguration('sameer').create_index_file.exclude_files;
  const excluder = excluder_patterns.length
    ? (filename) =>
        excluder_patterns.some((pattern) => minimatch(filename, pattern))
    : () => false;
  const root = statSync(uri.fsPath).isDirectory()
    ? uri.fsPath
    : dirname(uri.fsPath);

  const collectors = {
    ts: (s) => s.endsWith('.ts') && !s.endsWith('.spec.ts') && s !== 'index.ts',
    js: (s) => s.endsWith('.js') && !s.endsWith('.spec.js') && s !== 'index.js',
    scss: (s) => s[0] === '_' && s.endsWith('.scss') && s !== 'index.scss',
  };
  const barrelLines = {
    scss: (s) => `@import './${s.substring(1, s.length - 5)}';`,
  };

  const collected = readdirSync(root)
    .filter((s) => !excluder(s) && statSync(join(root, s)).isFile())
    .reduce((acc, curr) => {
      for (const key in collectors) {
        if (collectors[key](curr)) {
          acc[key].push(curr);
          break;
        }
      }

      return acc;
    }, Object.fromEntries(Object.keys(collectors).map((t) => [t, []])));

  function write(array, extension) {
    const filename = join(root, 'index.' + extension);
    const barrelLine =
      barrelLines[extension] ||
      ((s) => `export * from './${s.substring(0, s.length - 3)}';`);

    if (!array.length) {
      if (existsSync(filename)) {
        unlinkSync(filename);
        console.log('removed:', filename);
      }
    } else {
      writeFileSync(filename, array.sort().map(barrelLine).join('\n'));
      console.log('created:', filename);
    }
  }

  console.log(
    'create index: ',
    Object.fromEntries(
      Object.entries(collected).map(([s, t]) => [s, t.length])
    ),
    root
  );
  for (const key in collectors) {
    if (collected[key].length) {
      write(collected[key], key);
    }
  }
}
