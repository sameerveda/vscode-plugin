import { replaceSelections } from "./utils";

export function sortAttrs() {
  replaceSelections((data) => {
    const grouped = data.split(/\r?\n/g).reduce((acc, curr) => {
      const key = curr.trim()[0].match(/\w/) ? "a" : curr.trim()[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.localeCompare(b.trim())));

    const pluck = (key) => {
      const t = grouped[key];
      delete grouped[key];
      return t || [];
    };

    return [pluck("#"), pluck("*"), pluck("a"), pluck("["), pluck("@"), ...Object.values(grouped)]
      .flatMap((arr) => arr)
      .join("\n");
  });
}
