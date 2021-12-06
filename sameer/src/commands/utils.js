import { Selection, window } from 'vscode';

/**
 *
 * @param {(s: string, selection?: Selection) => string | Promise<string>} replacer
 * @returns
 */
export async function replaceSelections(replacer, appendError = false) {
  if (!replacer) throw new Error('replacer is required');

  const textEditor = window.activeTextEditor;
  if (!textEditor) {
    return;
  }

  let results = [];
  for (let n = 0; n < textEditor.selections.length; n++) {
    const s = textEditor.selections[n];
    try {
      results[n] = await replacer(textEditor.document.getText(s), s);
    } catch (error) {
      if (appendError)
        results[n] = `//${String(error)}\n${textEditor.document.getText(s)}`;
      else window.showErrorMessage(`Failed to evaluate "${s}", ${error}`);
      return;
    }
  }

  results = results.filter((s) => s != null);
  if (results.length == 0) return;

  textEditor.edit((editBuilder) => {
    for (let n = 0; n < textEditor.selections.length; n++) {
      const s = textEditor.selections[n];

      try {
        editBuilder.replace(s, results[n]);
      } catch (error) {
        window.showErrorMessage(`Failed to evaluate "${s}", ${error}`);
      }
    }
  });
}
