import { commands, window, workspace } from 'vscode';
import { sortAttrs } from './commands/angular-utils';
import { create_index_file } from './commands/create_file';
import { run_dynamic } from './commands/run_dynamic';
// import { doMath } from './commands/do-math';
import {
  apply_eval,
  sort_lines,
  apply_minify,
  json_to_ts,
} from './commands/string-operations';
import { show_config } from './commands/utils';

function activate(context) {
  function register(name, callback) {
    context.subscriptions.push(commands.registerCommand(name, callback));
  }

  register('sameer.eval', apply_eval);
  register('sameer.json_to_ts', json_to_ts);
  // register('sameer.doMath.selected', doMath);
  register('sameer.angular.sort_attrs', sortAttrs);
  register('sameer.create_index_file', create_index_file);
  register('sameer.sort_lines', sort_lines);
  register('sameer.minify', apply_minify);
  register('sameer.show_config', show_config);
  register('sam.utils.run_dynamic', run_dynamic);
  // add_new_command
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
