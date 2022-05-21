import { statSync, readdirSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { window, workspace } from "vscode";
const minimatch = require("minimatch");

export function create_index_file(uri) {
  const excluder_patterns = workspace.getConfiguration("sameer").create_index_file.exclude_files;
  const excluder = excluder_patterns.length
    ? (filename) => excluder_patterns.some((pattern) => minimatch(filename, pattern))
    : () => false;
  const root = statSync(uri.fsPath).isDirectory() ? uri.fsPath : dirname(uri.fsPath);

  const jsCollector = (ext) => ({
    files: [],
    addFile({ name, path, isDir }) {
      if (isDir && existsSync(join(path, "index" + ext))) return this.files.push(name), true;

      if (name.endsWith(ext) && !name.endsWith(".spec" + ext) && name !== "index.ts" && name !== "index.js") {
        return this.files.push(name.substring(0, name.length - 3)), true;
      }
    },
    finalize() {
      if (!this.files.length) return;
      const content = this.files
        .sort()
        .map((s) => `export * from './${s}';`)
        .join("\n");

      writeFileSync(join(root, "index" + ext), content);
    },
  });

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
