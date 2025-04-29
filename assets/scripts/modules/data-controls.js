import { codeSnippet } from '../controls/code-snippet.js';

export function initControls(callbacks = {}) {
    codeSnippet(callbacks.onCodeSnippetClick);
}