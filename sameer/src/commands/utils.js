import { Range, window } from "vscode";

export async function fullTextReplace(replacer) {
  if (!replacer) throw new Error("replacer is required");

  const textEditor = window.activeTextEditor;
  if (!textEditor) {
    return;
  }

  let invalidRange = new Range(0, 0, textEditor.document.lineCount /*intentionally missing the '-1' */, 0);
  let fullRange = textEditor.document.validateRange(invalidRange);
  const t = replacer(textEditor.document.getText(fullRange));
  t == null || textEditor.edit((edit) => edit.replace(fullRange, t));
}

export const getSelectedText = () => {
  const textEditor = window.activeTextEditor;
  const selection = textEditor?.selections?.[0];
  return selection ? textEditor.document.getText(selection) : null;
};

/**
 *
 * @param {(s: string, selection?: import('vscode').Selection) => string | Promise<string>} replacer
 * @returns
 */
export async function replaceSelections(replacer, appendError = false) {
  if (!replacer) throw new Error("replacer is required");

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
      if (appendError) results[n] = `//${String(error)}\n${textEditor.document.getText(s)}`;
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

export function show_config() {
  window.showInformationMessage(JSON.stringify("hello"));
}

/**
 *
 * @param {(s: string) => any} callback
 * @returns
 */
export function lodashCall(callback) {
  return () => replaceSelections((s) => callback(s));
}

/**
 * @template T,R
 * @param {(s: string, t: T) => R} callback
 * @param {import('vscode').InputBoxOptions} options
 * * @param {(s: string) => T} converter
 * @returns
 */
export function lodashCallWithInput(callback, options = {}, converter = (k) => k) {
  options.title = options.title || callback.name || "";

  return () =>
    replaceSelections(async (s) => {
      const t = await window.showInputBox(options);
      const c = t && converter(t);
      return c == null ? undefined : JSON.stringify(callback(s, c)).replace(/^"/, "").replace(/"$/, "");
    });
}
