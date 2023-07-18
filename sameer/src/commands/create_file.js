import { statSync, readdirSync, existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { escapeRegExp, groupBy, isEmpty } from "lodash-es";
import { dirname, extname, join } from "path";
import { window, workspace } from "vscode";
const minimatch = require("minimatch");

export async function create_index_file(uri) {
  const excluder_patterns = workspace.getConfiguration("sameer").create_index_file.exclude_files || [];
  const root = statSync(uri.fsPath).isDirectory() ? uri.fsPath : dirname(uri.fsPath);

  const excluder = excluder_patterns.length
    ? (filename) => excluder_patterns.some((pattern) => minimatch(filename, pattern))
    : () => false;

  const mappers = {
    ".js": (s) => (s.endsWith(".spec.js") ? null : `export * from "./${s.replace(".js", "")}"}`),
    ".ts": (s) => (s.endsWith(".spec.ts") ? null : `export * from "./${s.replace(".ts", "")}"`),
    ".dart": (s) => `export './${s}'`,
  };

  const items = groupBy(
    readdirSync(root).filter((s) => !excluder(s) && !statSync(join(root, s)).isDirectory()),
    extname
  );

  const exts = Object.keys(items);

  if (exts.length === 0)
    return window.showInformationMessage("no supported files found.\n supported: " + Object.keys(mappers).join(","));

  const choice =
    exts.length === 1
      ? exts[0]
      : await window.showQuickPick(Object.keys(items), {
          placeHolder: `Create index file for`,
        });

  if (!choice) return window.showInformationMessage("cancelled");

  writeFileSync(join(root, "index" + choice), items[choice].map(mappers[choice]).filter(Boolean).join("\n"));
}
