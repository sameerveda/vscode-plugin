import { window, Range, Position } from 'vscode';
import { evaluate } from 'mathjs';
import { replaceSelections } from './utils';

export const doMath = () => replaceSelections((s) => String(evaluate(s)));

export function doMathFullFile() {
  const textEditor = window.activeTextEditor;
  if (!textEditor) {
    return;
  }
  textEditor.edit((editBuilder) => {
    const firstLine = textEditor.document.lineAt(0);
    const lastLine = textEditor.document.lineAt(
      textEditor.document.lineCount - 1
    );
    const range = new Range(
      0,
      firstLine.range.start.character,
      textEditor.document.lineCount - 1,
      lastLine.range.end.character
    );

    const text = textEditor.document.getText(range);
    const matched = text.match(/(_?-?0x\w+\s*(?:\s*[\*\+\-\/]\s*-?0x\w+)*)/gm);

    if (!matched || matched.length === 0) return;

    const result = matched
      .filter((s) => s.trim() && s[0] !== '_')
      .sort((a, b) => b.localeCompare(a))
      .reduce((acc, match) => {
        try {
          return acc.replace(match, String(evaluate(match))); //`${evaluate(match)} /* ${match} */`);
        } catch (error) {
          window.showErrorMessage(`Failed to evaluate "${match}", ${error}`);
        }
        return acc;
      }, text);

    if (result === text) return;

    editBuilder.delete(range);
    editBuilder.insert(new Position(0, 0), result);
  });
}
