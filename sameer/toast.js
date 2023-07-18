const { statSync, readdirSync, existsSync, writeFileSync, unlinkSync, readFileSync } = require("fs");
const { escapeRegExp, groupBy } = require("lodash");
const { dirname, extname, join } = require("path");
const minimatch = require("minimatch");

const root = "G:/wc/gosee_billing_qr/lib/src/shared/css";
const excluder_patterns = [];

const excluder = excluder_patterns.length
  ? (filename) => excluder_patterns.some((pattern) => minimatch(filename, pattern))
  : () => false;

const items = groupBy(
  readdirSync(root).filter((s) => !excluder(s) && !statSync(join(root, s)).isDirectory()),
  extname
);

console.log(items);
