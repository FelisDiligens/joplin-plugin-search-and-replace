import { Editor, Position } from 'codemirror';
import { Range, escapeRegExp, escapeReplacement, wildCardToRegExp } from './utils';

async function alert(context, title, text) {
    return await context.postMessage({
        name: "alert",
        title: title,
        text: text
    });
}

function prepareRegex(searchPattern: string, options): RegExp {
    let regexFlags = "";
    if (options.global)
        regexFlags += "g";
    if (!options.matchCase)
        regexFlags += "i";

    switch (options.matchMethod.trim().toLowerCase()) {
        case "regex":
        case "regexp":
            return new RegExp(searchPattern, regexFlags);
        case "wildcards":
            return new RegExp(wildCardToRegExp(searchPattern, false), regexFlags);
        case "literal":
        default:
            return new RegExp(escapeRegExp(searchPattern), regexFlags);
    }
}

function prepareReplacement(replacement: string, options): string {
    switch (options.matchMethod.trim().toLowerCase()) {
        case "regex":
        case "regexp":
            return replacement;
        case "wildcards":
        case "literal":
        default:
            return escapeReplacement(replacement);
    }
}

function validate(context, form): boolean {
    // Empty pattern string isn't allowed:
    if (form.searchPattern.length == 0) {
        alert(context, "Empty pattern", "Please enter a search pattern.");
        return false;
    }
    return true;
}

function firstLineAndCh() {
    return {line: 0, ch: 0};
}

function lastLineAndCh(cm: Editor) {
    return {line: cm.lastLine(), ch: cm.getLine(cm.lastLine()).length};
}

function getSelectedRange(cm: Editor): Range {
    // Source: https://stackoverflow.com/questions/11390826/get-selected-range-in-codemirror
    return { from: cm.getCursor("from"), to: cm.getCursor("to") };
}

function getMatchRange(content: string, matchIndex: number, matchLength: number, cursor: Position): Range {
    // Get the line number by counting "\n" and adding it to the current line number:
    let curLine = cursor.line + (content.substring(0, matchIndex).match(/\n/g) || []).length;

    // Get the column (or char) by getting the length of the substring between the last "\n" and the index:
    let curCh = content.substring(content.substring(0, matchIndex).lastIndexOf("\n") + 1, matchIndex).length;

    // If the cursor is on the same line, add the remaining length before the cursor:
    if (curLine == cursor.line)
        curCh += cursor.ch;

    // Create the selection range:
    return {
        from: {
            line: curLine,
            ch: curCh
        } as Position,
        to: {
            line: curLine,
            ch: curCh + matchLength
        } as Position
    } as Range;
}

function firstMatch(string: string, regex: RegExp) {
    if (regex.global)
        throw new Error("Call lastMatch with a regex that *doesn't* have the global flag.")
    var match = string.match(regex);
    return match ? {index: match.index, length: match[0].length} : null;
}

function lastMatch(string, regex: RegExp) {
    // https://stackoverflow.com/questions/19445994/javascript-string-search-for-regex-starting-at-the-end-of-the-string
    if (!regex.global)
        throw new Error("Call lastMatch with a regex that has the global flag.")
    var match = string.match(regex);
    return match ? {index: string.lastIndexOf(match.slice(-1)), length: match.slice(-1)[0].length} : null;
}

function findNext(context, cm: Editor, form, replace: boolean) {
    if (!validate(context, form))
        return;

    // Get editor and cursor:
    let cursor:   Position = replace ? cm.getCursor("from") : cm.getCursor("to");
    let firstPos: Position = firstLineAndCh();
    let lastPos:  Position = lastLineAndCh(cm);

    // Get note content beginning from the cursor:
    let contentStart = cursor;
    let contentEnd = lastPos;
    let content = cm.getRange(cursor, lastPos);

    // Get regex:
    let regex;
    try {
        regex = prepareRegex(form.searchPattern, {...form.options, global: false});
    } catch (exc) {
        alert(context, "Invalid regular expression", exc.toString());
    }

    // Search:
    let match = firstMatch(content, regex);

    // Nothing found but 'Wrap around' is active?
    if (!match && form.options.wrapAround) {
        // Search from the start:
        contentStart = firstPos;
        contentEnd = cursor;
        content = cm.getRange(firstPos, cursor);
        match = firstMatch(content, regex);
    }

    // Still nothing found?
    if (!match) {
        alert(context, "No more occurences found", `"${form.searchPattern}" couldn't be found.`);
        return;
    }

    // Replace the matched text:
    if (replace) {
        content = content.replace(regex, prepareReplacement(form.replacement, form.options));
        cm.replaceRange(content, contentStart, contentEnd);
    }

    // Select the text that has been found:
    let newSelection = getMatchRange(content, match.index, replace ? form.replacement.length : match.length, contentStart);
    cm.setSelection(newSelection.from, newSelection.to);

    // Needed for the cursor to be visible:
    cm.refresh();
    cm.focus();
}

function findPrevious(context, cm: Editor, form, replace: boolean) {
    if (!validate(context, form))
        return;

    // Get editor and cursor:
    let cursor:   Position = replace ? cm.getCursor("to") : cm.getCursor("from");
    let firstPos: Position = firstLineAndCh();
    let lastPos:  Position = lastLineAndCh(cm);

    // Get note content ending at the cursor:
    let contentStart = firstPos;
    let contentEnd = cursor;
    let content = cm.getRange(firstPos, cursor);

    // Get regex:
    let regex;
    try {
        regex = prepareRegex(form.searchPattern, {...form.options, global: true});
    } catch (exc) {
        alert(context, "Invalid regular expression", exc.toString());
    }


    // Search:
    let match = lastMatch(content, regex);

    // Nothing found but 'Wrap around' is active?
    if (!match && form.options.wrapAround) {
        // Search from the end:
        contentStart = cursor;
        contentEnd = lastPos;
        content = cm.getRange(cursor, lastPos);
        match = lastMatch(content, regex);
    }

    // Still nothing found?
    if (!match) {
        alert(context, "No more occurences found", `"${form.searchPattern}" couldn't be found.`);
        return;
    }

    // Replace the matched text:
    if (replace) {
        content = content.replace(regex, prepareReplacement(form.replacement, form.options));
        cm.replaceRange(content, contentStart, contentEnd);
    }

    // Select the text that has been found:
    let newSelection = getMatchRange(content, match.index, replace ? form.replacement.length : match.length, contentStart);
    cm.setSelection(newSelection.from, newSelection.to);

    // Needed for the cursor to be visible:
    cm.refresh();
    cm.focus();
}

module.exports = {
    default: function(context) {
        const plugin = function(CodeMirror) {
            CodeMirror.defineExtension('SARPlugin.findNext', async function(form) {
                findNext(context, this as Editor, form, false);
            });

            CodeMirror.defineExtension('SARPlugin.findPrevious', async function(form) {
                findPrevious(context, this as Editor, form, false);
            });

            CodeMirror.defineExtension('SARPlugin.replace', async function(form) {
                findNext(context, this as Editor, form, true);
                findNext(context, this as Editor, form, false);
            });

            CodeMirror.defineExtension('SARPlugin.replaceAll', async function(form) {
                // Get editor and cursor:
                let cm:       Editor   = this;
                let cursor:   Position = cm.getCursor();
                let firstPos: Position = firstLineAndCh();
                let lastPos:  Position = lastLineAndCh(cm);

                // Get regex:
                let regex;
                try {
                    regex = prepareRegex(form.searchPattern, {...form.options, global: true});
                } catch (exc) {
                    alert(context, "Invalid regular expression", exc.toString());
                }

                // Get content:
                let content = cm.getValue();

                // Nothing found?
                if (content.search(regex) < 0) {
                    alert(context, "No occurences found", `"${form.searchPattern}" couldn't be found. Nothing was replaced.`);
                    return;
                }

                // Replace all matches:
                content = content.replace(regex, prepareReplacement(form.replacement, form.options));

                // Using replaceRange, because otherwise the Markdown viewer does not get updated:
                // cm.setValue(content);
                cm.replaceRange(content, firstPos, lastPos);

                // Set previous cursor position:
                cm.setCursor(cursor);
            });
        }

        return { plugin }
    }
}