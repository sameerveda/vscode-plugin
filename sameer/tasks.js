const { existsSync, writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const { red, green } = require('kleur');
const { snakeCase } = require('lodash');

const tasks = {};

// e.g. node tasks.js add_command awl "Convert GetDlgItem expression"
tasks.add_command = function (args) {
  let [filename, description] = args;
  if (args.length !== 2 || !filename?.trim() || !description?.trim()) {
    return console.log(
      red('bad command'),
      '\nusage: node tasks.js add_command [command-file-name] [command-description]\ne.g. node tasks.js add_command awl "Convert GetDlgItem expression"'
    );
  }

  const packageFile = require('./package.json');
  const commands_dir = 'src/commands';

  if (!filename.endsWith('.js')) filename = filename + '.js';

  const filepath = join(commands_dir, filename);
  const name = snakeCase(filename.replace(/\.js$/, '').trim()).toLowerCase();
  const functionName = snakeCase(description.trim()).toLowerCase();

  if (!existsSync(filepath))
    return console.log(red('file not found: '), filepath);

  const id = `sam.${name}.${snakeCase(description)}`.toLowerCase();
  if (packageFile.activationEvents.includes('onCommand:' + id)) {
    return console.log(red('duplicate command: '), id);
  }

  packageFile.activationEvents.push('onCommand:' + id);
  packageFile.contributes.commands.push({
    command: id,
    title: 'Sameer: ' + description,
  });

  const extension_path = './src/extension.js';
  let extension_content = readFileSync(extension_path, 'utf-8');

  function replace(replace, replacement) {
    if (!extension_content.includes(replace)) {
      console.log(
        red(`'placeholder ${replace} not found in '` + extension_path)
      );
      return false;
    }

    extension_content = extension_content.replace(replace, replacement);
    return true;
  }

  if (
    !(
      replace(
        '// add_new_command',
        `register("${id}", ${functionName});\n// add_new_command`
      ) &&
      replace(
        `} from './commands/${filename.replace(/\.js$/, '')}'`,
        `, ${functionName} } from './commands/${filename.replace(/\.js$/, '')}'`
      )
    )
  ) {
    return;
  }

  writeFileSync(
    filepath,
    readFileSync(filepath, 'utf-8').concat(
      `\n\nexport function ${functionName}() {\n// TODO \n}`
    )
  );
  console.log(green('added function: '), functionName, green('to'), filepath);

  writeFileSync(extension_path, extension_content);
  console.log(green('updated'), extension_path);

  writeFileSync('./package.json', JSON.stringify(packageFile, null, 2));
};

if (!tasks[process.argv[2]])
  throw new Error('task not found: ' + process.argv[2]);

tasks[process.argv[2]](process.argv.slice(3));
