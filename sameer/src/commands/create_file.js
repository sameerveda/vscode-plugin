import { statSync, readdirSync, existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { escapeRegExp } from "lodash-es";
import { dirname, join } from "path";
import { window, workspace } from "vscode";
const minimatch = require("minimatch");

export function create_index_file(uri) {
  const excluder_patterns = workspace.getConfiguration("sameer").create_index_file.exclude_files;
  const excluder = excluder_patterns.length
    ? (filename) => excluder_patterns.some((pattern) => minimatch(filename, pattern))
    : () => false;
  const root = statSync(uri.fsPath).isDirectory() ? uri.fsPath : dirname(uri.fsPath);

  const jsCollector = (ext) => {
    const findExt = new RegExp(escapeRegExp(ext) + "x?$");
    const replaceExt = new RegExp(escapeRegExp(ext) + "$");
    return {
      files: [],
      addFile({ name, path, isDir }) {
        if (isDir && existsSync(join(path, "index" + ext))) return this.files.push(name), true;

        if (findExt.test(ext) && !name.includes(".spec." + ext) && name !== "index.ts" && name !== "index.js") {
          return this.files.push(name.replace(replaceExt, "")), true;
        }
      },
      finalize() {
        if (!this.files.length) return;
        const content = this.files
          .sort()
          .map((s) => `export * from './${s}';`)
          .join("\n");

        const out = join(root, "index" + ext);
        if (existsSync(out) && readFileSync(out, "utf-8").includes("@no-index-generate"))
          window.showInformationMessage("index-generate skipped, @no-index-generate found.");
        else writeFileSync(out, content);
      },
    };
  };

  const collectors = [
    jsCollector(".ts"),
    jsCollector(".js"),
    {
      files: [],
      addFile({ name, path, isDir }) {
        if (isDir && (existsSync(join(path, "index.scss")) || existsSync(join(path, "_index.scss"))))
          return this.files.push(name + "/index"), true;

        if (name.endsWith(".scss") && name !== "index.scss" && name !== "_index.scss") {
          this.files.push(name.replace(/\.scss$/, "").replace(/^_/, ""));
          return true;
        }
      },
      finalize() {
        if (!this.files.length) return;
        const content = this.files
          .sort()
          .map((s) => `@import './${s}';`)
          .join("\n");

        writeFileSync(join(root, "_index.scss"), content);
      },
    },
  ];

  readdirSync(root)
    .filter((s) => !excluder(s))
    .forEach((name) => {
      const path = join(root, name);
      const isDir = statSync(path).isDirectory();
      collectors.find((t) => t.addFile({ name, path, isDir }));
    });

  collectors.forEach((t) => t.finalize());
}
