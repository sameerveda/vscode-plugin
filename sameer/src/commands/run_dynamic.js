import { existsSync, statSync } from 'fs';
import { join } from 'path';
import vscode, { window, workspace } from 'vscode';
import { replaceSelections } from './utils';

let last_mod_run_dynamic = 0;
let keys = null;

export async function run_dynamic() {
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

  const new_mode = statSync(file).mtimeMs;
  if (last_mod_run_dynamic != null) {
    last_mod_run_dynamic = new_mode;
    delete require.cache[require.resolve(file)];
    keys = null;
  }

  const imported = require(file);
  if (!keys) Object.keys(imported);

  if (!keys.length)
    return void window.showErrorMessage('file .vscode/sam-dynamic.js is empty');

  const choice = await window.showQuickPick(keys, {
    placeHolder: 'updated on: ' + new Date(last_mod_run_dynamic),
  });
  if (!choice) return void window.showInformationMessage('cancelled');

  if (keys[0] !== choice) {
    keys.splice(keys.indexOf(choice), 1);
    keys.unshift(choice);
  }
  imported[choice]({ replaceSelections, vscode });
}
