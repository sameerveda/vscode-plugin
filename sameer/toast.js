const { statSync, readdirSync, existsSync, writeFileSync, unlinkSync, readFileSync } = require("fs");
const { escapeRegExp, groupBy, isEmpty } = require("lodash");
const { dirname, extname, join } = require("path");
const minimatch = require("minimatch");

async function create_index_file(uri) {
  const excluder_patterns = [];
  const root = "G:/github_projects/flutter_sam_app/lib/src/shared/enums";

  const excluder = excluder_patterns.length
    ? (filename) => excluder_patterns.some((pattern) => minimatch(filename, pattern))
    : () => false;

  const mappers = {
    ".js": (s) => (s.endsWith(".spec.js") ? null : `export * from './${s.replace(".js", "")}';`),
    ".ts": (s) => (s.endsWith(".spec.ts") ? null : `export * from './${s.replace(".ts", "")}';`),
    ".dart": (s) => `export './${s}';`,
  };

  const items = groupBy(
    readdirSync(root).filter((s) => !excluder(s) && !statSync(join(root, s)).isDirectory()),
    extname
  );

  console.log(items);

  const exts = Object.keys(items);

  const choice = exts.length === 1 ? exts[0] : null;

  const out = "index" + choice;
  console.log(
    join(root),
    items[choice]
      .filter((t) => out != t)
      .map(mappers[choice])
      .filter(Boolean)
      .join("\n")
  );
}

create_index_file();