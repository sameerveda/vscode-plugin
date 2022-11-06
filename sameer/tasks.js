const { existsSync, writeFileSync, readFileSync } = require("fs");
const { join } = require("path");
const { red, green } = require("kleur");
const { snakeCase } = require("lodash-es");

const tasks = {};

// e.g. node tasks.js add_command awl "Convert GetDlgItem expression"
tasks.add_command = function (title, command) {
  if (!title) {
    return console.log(
      red("bad command"),
      '\nusage: node tasks.js add_command [command-title] [command-name?]\ne.g. node tasks.js add_command "Convert GetDlgItem expression"'
    );
  }

  const packageFile = require("./package.json");
  command = `sam.${snakeCase(command || title).toLowerCase()}`;

  if (packageFile.activationEvents.includes("onCommand:" + command)) {
    return console.log(red("duplicate command: "), command);
  }
  const cmd = {
    command,
    title: "Sameer: " + title,
  };

  packageFile.activationEvents.push("onCommand:" + command);
  packageFile.contributes.commands.push(cmd);

  console.log(cmd);

  const extension_path = "./src/extension.js";
  let extension_content = readFileSync(extension_path, "utf-8");

  writeFileSync(
    extension_path,
    extension_content.replace(
      "// add_new_command",
      `register('${command}', () => console.log(${JSON.stringify(
        cmd
      )}));\n// add_new_command`
    )
  );

  writeFileSync("./package.json", JSON.stringify(packageFile, null, 2));
};

if (!tasks[process.argv[2]])
  throw new Error("task not found: " + process.argv[2]);

tasks[process.argv[2]](...process.argv.slice(3));
