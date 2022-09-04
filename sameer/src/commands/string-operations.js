import { replaceSelections } from "./utils";
import { minify } from "terser";
import { window, env, workspace } from "vscode";

import { statSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, basename, join, resolve } from "path";
import JsonToTS from "json-to-ts";
import postcss from "postcss";
import cssnano from "cssnano";
import postcssNested from "postcss-nested";

export function apply_eval() {
  // https://esbuild.github.io/content-types/#direct-eval
  replaceSelections((s) => {
    const v = (0, eval)(s);
    if (typeof v === "string") return JSON.stringify(v);
    return String(v);
  });
}

export function sort_lines() {
  replaceSelections((s) =>
    s
      .split(/\r?\n/g)
      .sort((a, b) => a.trim().localeCompare(b.trim()))
      .join("\n")
  );
}

const minify_options = {
  keep_fnames: true,
  compress: true,
  mangle: true,
  sourceMap: true,
};

export async function process_with_compiler({ uri, compiler, copyMsg, inputOption }) {
  if (!uri) {
    return void (await replaceSelections(async (s) => {
      const code = await compiler(s);
      env.clipboard.writeText(`/* Updated: ${new Date().toISOString()} (${code.length}) */\n` + code);
      window.showInformationMessage(`Saved to clipboard: ${copyMsg}`);
      return null;
    }));
  }

  const filepath = uri.fsPath;
  let outFile = await window.showInputBox({
    ...inputOption,
    value: basename(filepath).replace(/(\.\w+)$/, ".min$1"),
  });

  if (!outFile || !outFile.trim()) {
    window.showErrorMessage("Cancelled");
    return;
  }

  outFile = resolve(join(dirname(filepath), outFile));

  !statSync(dirname(outFile)).isDirectory() && mkdirSync(dirname(outFile), { recursive: true });

  writeFileSync(outFile, await compiler(readFileSync(filepath, "utf-8")));

  window.showInformationMessage("Saved: " + resolve(outFile));
}

export async function compile_css_postcss(uri) {
  process_with_compiler({
    uri,
    compiler: (content) =>
      postcss(postcssNested)
        .process(content)
        .then(({ css }) => css),
    copyMsg: `(${window.activeTextEditor.document.fileName.endsWith(".css") ? "css" : "js"})`,
    inputOption: { placeHolder: "Save minified file To", prompt: "Sameer: Minify" },
  });
}

const minifiers = {
  css: (content) =>
    postcss([cssnano({ preset: "default" })])
      .process(content)
      .then(({ css }) => css),
  js: (content) => minify(content, minify_options).then(({ code }) => code),
};

export async function apply_minify(uri) {
  const ext = /(\w+)$/.exec(uri?.fsPath || window.activeTextEditor?.document?.fileName || "")?.[1].toLowerCase();
  if (!ext || !(ext in minifiers)) {
    const choice = await window.showQuickPick(Object.keys(minifiers), {
      placeHolder: "select minifier type",
    });

    if (!choice) return void window.showInformationMessage("cancelled");
  }

  const compiler = minifiers[ext];

  process_with_compiler({
    uri,
    compiler,
    copyMsg: `(${window.activeTextEditor.document.fileName.endsWith(".css") ? "css" : "js"})`,
    inputOption: { placeHolder: "Save minified file To", prompt: "Sameer: Minify" },
  });
}

export function json_to_ts() {
  replaceSelections((s) => JsonToTS(JSON.parse(s)).join("\n"), true);
}
