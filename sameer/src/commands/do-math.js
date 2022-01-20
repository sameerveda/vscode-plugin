import { window, Range, Position } from 'vscode';
import { evaluate } from 'mathjs';
import { replaceSelections } from './utils';

export const doMath = () => replaceSelections((s) => String(evaluate(s)));
