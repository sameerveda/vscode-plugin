import { replaceSelections } from './utils';

const prefixes = ['#', '[', '@', '('];
const compare_equal = (a, b) => {
  if (
    (a.includes('=') && b.includes('=')) ||
    (!a.includes('=') && !b.includes('='))
  ) {
    return a.localeCompare(b);
  }

  return a.includes('=') ? 1 : -1;
};
const compare_prefix = (a, b, prefix) => {
  if (a[0] === prefix && b[0] === prefix) return compare_equal(a, b);
  if (a[0] === prefix || b[0] === prefix) return a[0] === prefix ? -1 : 1;
};

export function sortAttrs() {
  replaceSelections((s) => {
    return s.split(/\r?\n/g).sort((a, b) => {
      a = a.toLowerCase().trim();
      b = b.toLowerCase().trim();
      if (a.localeCompare(b) == 0) return 0;
      let t = compare_prefix(a, b, '#');
      if (t != null) return t;
      if (!prefixes.includes(a[0]) && !prefixes.includes(b[0]))
        return compare_equal(a, b);
      if (!(prefixes.includes(a[0]) && prefixes.includes(b[0])))
        return prefixes.includes(a[0]) ? 1 : -1;

      if (t == null) t = compare_prefix(a, b, '[');
      if (t == null) t = compare_prefix(a, b, '@');
      if (t == null) t = compare_prefix(a, b, '(');
      if (t == null) t = compare_equal(a, b);

      return t;
    }).join('\n');
  });
}
