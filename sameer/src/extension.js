import { commands, window, workspace } from "vscode";
import { sortAttrs } from "./commands/angular-utils";
import { create_index_file } from "./commands/create_file";
import { run_dynamic } from "./commands/run_dynamic";
// import { doMath } from './commands/do-math';
import { apply_eval, sort_lines, apply_minify, json_to_ts, compile_css_postcss } from "./commands/string-operations";
import { lodashCall, lodashCallWithInput, replaceSelections, show_config } from "./commands/utils";
import {
  camelCase,
  capitalize,
  deburr,
  escape,
  unescape,
  escapeRegExp,
  kebabCase,
  lowerCase,
  lowerFirst,
  upperFirst,
  parseInt,
  repeat,
  snakeCase,
  split,
  startCase,
  trim,
  trimEnd,
  trimStart,
  words,
} from "lodash-es";

function activate(context) {
  function register(name, callback) {
    context.subscriptions.push(commands.registerCommand(name, callback));
  }

  register("sameer.eval", apply_eval);
  register("sameer.json_to_ts", json_to_ts);
  // register('sameer.doMath.selected', doMath);
  register("sameer.angular.sort_attrs", sortAttrs);
  register("sameer.create_index_file", create_index_file);
  register("sameer.sort_lines", sort_lines);
  register("sameer.rm_new_lines", () => replaceSelections((s) => s.replace(/\r?\n/g, "")));
  register("sameer.minify", apply_minify);
  register("sameer.compile_css_postcss", compile_css_postcss);
  register("sameer.show_config", show_config);
  register("sam.utils.run_dynamic", run_dynamic);
  register("sameer.replace-slash_1", () => replaceSelections((s) => s.replace(/\\/g, "/")));
  register("sameer.replace-slash_2", () => replaceSelections((s) => s.replace(/\\/g, "\\\\")));
  register("sam.lodash.camelCase", lodashCall(camelCase));
  register("sam.lodash.capitalize", lodashCall(capitalize));
  register("sam.lodash.deburr", lodashCall(deburr));
  register("sam.lodash.escape", lodashCall(escape));
  register("sam.lodash.unescape", lodashCall(unescape));
  register("sam.lodash.escapeRegExp", lodashCall(escapeRegExp));
  register("sam.lodash.kebabCase", lodashCall(kebabCase));
  register("sam.lodash.lowerCase", lodashCall(lowerCase));
  register("sam.lodash.lowerFirst", lodashCall(lowerFirst));
  register("sam.lodash.upperFirst", lodashCall(upperFirst));
  register(
    "sam.lodash.parseInt",
    lodashCallWithInput(parseInt, { placeHolder: "Enter radix", value: "10" }, (t) => +t)
  );
  register(
    "sam.lodash.repeat",
    lodashCallWithInput(repeat, { placeHolder: "Enter repeat count" }, (t) => +t)
  );
  register("sam.lodash.snakeCase", lodashCall(snakeCase));
  register("sam.lodash.split", lodashCallWithInput(split, { placeHolder: "Enter repeat count" }));
  register("sam.lodash.startCase", lodashCall(startCase));
  register("sam.lodash.trim", lodashCall(trim));
  register("sam.lodash.trimEnd", lodashCall(trimEnd));
  register("sam.lodash.trimStart", lodashCall(trimStart));
  register("sam.lodash.words", lodashCall(words));
  // add_new_command
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
