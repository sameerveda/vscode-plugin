const vscode = require('vscode');

function activate(context) {
	let disposable = vscode.commands.registerCommand('sameer.doMath', function () {
		vscode.window.showInformationMessage('Hello World from sameer!');
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
