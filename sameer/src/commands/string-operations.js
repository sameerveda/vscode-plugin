import { replaceSelections } from './utils';
import { minify } from 'terser';
import { window, env, workspace } from 'vscode';

import { statSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { dirname, basename, join, resolve } from 'path';
import JsonToTS from 'json-to-ts';

export function apply_eval() {
  // https://esbuild.github.io/content-types/#direct-eval
  replaceSelections((s) => {
    const v = (0, eval)(s);
    if (typeof v === 'string') return JSON.stringify(v);
    return String(v);
  });
}

export function sort_lines() {
  replaceSelections((s) =>
    s
      .split(/\r?\n/g)
      .sort((a, b) => a.trim().localeCompare(b.trim()))
      .join('\n')
  );
}

const minify_options = {
  keep_fnames: true,
  compress: true,
  mangle: true,
  sourceMap: true,
};
export async function apply_minify(uri) {
  if (!uri) {
    return void (await replaceSelections(async (s) => {
      env.clipboard.writeText((await minify(s, minify_options)).code);
      window.showInformationMessage('Saved to clipboard');
      return null;
    }));
  }

  const filepath = uri.fsPath;
  let outFile = await window.showInputBox({
    placeHolder: 'Save minified file To',
    prompt: 'Sameer: Minify',
    value: basename(filepath).replace(/(\.\w+)$/, '.min$1'),
  });

  if (!outFile || !outFile.trim()) {
    window.showErrorMessage('Cancelled');
    return;
  }

  outFile = resolve(join(dirname(filepath), outFile));

  !statSync(dirname(outFile)).isDirectory() &&
    mkdirSync(dirname(outFile), { recursive: true });

  writeFileSync(
    outFile,
    (await minify(readFileSync(filepath, 'utf-8'), minify_options)).code
  );

  window.showInformationMessage('Saved: ' + resolve(outFile));
}

export function json_to_ts() {
  replaceSelections((s) => JsonToTS(JSON.parse(s)).join('\n'), true);
}
