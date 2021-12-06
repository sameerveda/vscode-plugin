const tasks = {};

tasks.add_command = function(args) {

}

if(!tasks[process.argv[2]]) throw new Error('task not found: ' + process.argv[2]);

tasks[process.argv[2]](process.argv.slice(3));