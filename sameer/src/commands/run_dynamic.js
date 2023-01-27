import { existsSync, statSync } from 'fs';
import { join } from 'path';
import vscode, { window, workspace } from 'vscode';
import { replaceSelections, getSelectedText, fullTextReplace } from './utils';
import { isFunction, escapeRegExp } from 'lodash-es';

let last_mod_run_dynamic = 0;
let updateCount = 0;
let callCount = 0;
let allOptions;

async function _run_dynamic() {
  const file = workspace.workspaceFolders
    .map(
      (item) =>
        item?.uri?.fsPath && join(item.uri.fsPath, '.vscode/sam-dynamic.js')
    )
    .filter(Boolean)
    .find((file) => existsSync(file));

  if (!file)
    return void window.showErrorMessage(
      'file .vscode/sam-dynamic.js not found'
    );

  const new_mtime = statSync(file).mtimeMs;
  if (last_mod_run_dynamic != new_mtime) {
    last_mod_run_dynamic = new_mtime;
    delete require.cache[require.resolve(file)];

    allOptions = Object.entries(require(file)).map(([k, v]) => ({
      key: k,
      accessTime: 0,
      handler: isFunction(v) ? v : v.handler,
      visible: () =>
        v.visible == null || (isFunction(v.visible) ? v.visible() : v.visible),
      title: () =>
        !v.title ? k : isFunction(v.title) ? v.title(v, k) : String(v.title),
    }));

    updateCount++;
  }

  const activeOptions = allOptions
    .filter((v) => v.visible())
    .sort((a, b) => b.accessTime - a.accessTime);

  if (!activeOptions.length)
    return void window.showErrorMessage('file .vscode/sam-dynamic.js is empty');

  const texts = activeOptions.map((t) => t.title());
  const choice = await window.showQuickPick(texts, {
    placeHolder: `updated/call count: ${updateCount}/${callCount}/${texts.length}`,
  });

  if (!choice) return void window.showInformationMessage('cancelled');

  const option = activeOptions[texts.indexOf(choice)];

  option.handler({ replaceSelections, fullTextReplace, escapeRegExp, getSelectedText, vscode });
  option.accessTime = Date.now();
  callCount++;
}

export async function run_dynamic() {
  try {
    await _run_dynamic();
  } catch (error) {
    window.showErrorMessage(error.message || String(error));
  }
}
