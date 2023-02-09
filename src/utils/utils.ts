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

/** Create a RegExp with the given `searchPattern` and `options`. */
export function prepareRegex(searchPattern: string, options: {global: boolean, matchCase: boolean, matchMethod: "regex" | "wildcards" | "literal", matchWholeWord: boolean}): RegExp {
    let regexFlags = "";
    if (options.global)
        regexFlags += "g";
    if (!options.matchCase)
        regexFlags += "i";

    let regexStr = searchPattern;

    switch (options.matchMethod.trim().toLowerCase()) {
        case "regex":
            break;
        case "wildcards":
            regexStr = wildCardToRegExp(searchPattern, false);
            break;
        case "literal":
        default:
            regexStr = escapeRegExp(searchPattern);
            break;
    }

    if (options.matchWholeWord)
        regexStr = "\\b" + regexStr + "\\b";

    return new RegExp(regexStr, regexFlags);
}

/** Create a replacement string for `string.replace(regex)` with the given `replacement` and `options`.*/
export function prepareReplacement(replacement: string, options: {matchMethod: "regex" | "wildcards" | "literal"}): string {
    switch (options.matchMethod.trim().toLowerCase()) {
        case "regex":
            return replacement;
        case "wildcards":
        case "literal":
        default:
            return escapeReplacement(replacement);
    }
}