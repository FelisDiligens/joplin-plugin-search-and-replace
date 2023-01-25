import { Position } from 'codemirror';

export interface Range {
    from: Position,
    to: Position
}

export function sanitizeHTML(text) {
    var element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}

export function escapeRegExp(str) {
    // Source: https://stackoverflow.com/a/6969486
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function escapeReplacement(str) {
    // Source: https://stackoverflow.com/a/6969486
    return str.replace(/\$/g, '$$$$');
}