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

/**
 * Converts a string with wildcards ("*" or "?") to a regular expression.
 * 
 * "?"  - any character  (one and only one)  
 * "*"  - any characters (zero or more)  
 * "\?" - a question mark  
 * "\*" - an asterisks
 * @param value 
 * @param beginToEnd 
 */
export function wildCardToRegExp(value: string, beginToEnd: boolean = true) {
    // Source: https://stackoverflow.com/a/30300521
    return (beginToEnd ? "^" : "") +
        escapeRegExp(value)                 // Escape regex
        .replace(/(?<!\\)\\\?/g, ".")       // Replace '?'  (after escape '\?')   with '.'
        .replace(/(?<!\\)\\\*/g, ".*")      // Replace '*'  (after escape '\*')   with '.*'
        .replace(/(?<!\\)\\\\\\\?/g, "\\?") // Replace '\?' (after escape '\\\?') with '\?'
        .replace(/(?<!\\)\\\\\\\*/g, "\\*") // Replace '\*' (after escape '\\\*') with '\*'
        + (beginToEnd ? "$" : "");
}