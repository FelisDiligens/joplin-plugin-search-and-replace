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

/**
 * Creates a RegExp instance with the given parameters, but escapes `searchValue` first, in order to match the string **exactly**.
 */
export function escapeRegex(searchValue: string, flags: string = ""): RegExp {
    // Source: https://stackoverflow.com/a/20759804
    return new RegExp(searchValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
}