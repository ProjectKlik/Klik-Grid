import { codeSnippet } from '../controls/code-snippet.js';
import { actionHistory } from '../controls/action-history.js';

export function dataInitControls(callbacks = {}) {
    codeSnippet(callbacks.onCodeSnippetClick);
    actionHistory(callbacks.onActionHistoryChanged);
}