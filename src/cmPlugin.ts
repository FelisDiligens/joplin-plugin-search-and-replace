import { Editor, Position } from 'codemirror';
import { Range } from './cmUtils';

/**
 * Creates a RegExp instance with the given parameters, but escapes `searchValue` first, in order to match the string **exactly**.
 */
function escapeRegex(searchValue: string, flags: string = ""): RegExp {
    // Source: https://stackoverflow.com/a/20759804
    return new RegExp(searchValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
}

/*
function stringReplace(str: string, searchValue: string, replaceValue: string, caseInsensitive: boolean = false, allOccurences: boolean = false): string {
    let flags = "";
    if (allOccurences)
        flags += "g";
    if (caseInsensitive)
        flags += "i";
    return str.replace(escapeRegex(searchValue, flags), replaceValue);
}
*/

module.exports = {
    default: function(context) {
        const plugin = function(CodeMirror) {
            CodeMirror.defineExtension('searchAndReplace', async function() {
                // Open "Search and replace" dialog
                let result = await context.postMessage({
                    name: "openDialog"
                });
                // If "Cancel" wasn't pressed:
                if (result.confirm) {
                    // Gather form data:
                    let pattern = result.formData.pattern;
                    let replacement = result.formData.replacement;
                    let useRegex = result.formData.useregex == "on";
                    let caseInsensitive = result.formData.caseinsensitive == "on";
                    let replaceAll = result.id == "replaceAll";

                    /*
                     * Checking input:
                     */

                    // Unknown button pressed or invalid form data types:
                    if ((result.id != "replaceAll" &&
                         result.id != "replaceNext") ||
                        typeof pattern !== "string" ||
                        typeof replacement !== "string") {
                            console.error("Something went wrong.");
                            await context.postMessage({
                                name: "alert",
                                text: "Dialog closed in an invalid state.",
                                title: "Something went wrong"
                            });
                            return;
                    }

                    // Empty pattern string isn't allowed:
                    if (pattern.length == 0) {
                        console.error("Empty pattern string disallowed.");
                        await context.postMessage({
                            name: "alert",
                            text: "Please enter a search pattern.",
                            title: "Empty pattern"
                        });
                        return;
                    }

                    /*
                     * Preparing regex:
                     */

                    let regexFlags = "";
                    if (replaceAll)
                        regexFlags += "g";
                    if (caseInsensitive)
                        regexFlags += "i";

                    let regexPattern;
                    if (useRegex) {
                        try {
                            regexPattern = new RegExp(pattern, regexFlags);
                        } catch (exc) {
                            console.error(exc);
                            await context.postMessage({
                                name: "alert",
                                text: exc.message,
                                title: "Invalid regular expression."
                            });
                            return;
                        }
                    } else {
                        regexPattern = escapeRegex(pattern, regexFlags);
                    }
                    

                    // Get editor and cursor:
                    let cm: Editor = this;
                    let cursor = cm.getCursor();
                    let lastPos = {line: cm.lastLine(), ch: cm.getLine(cm.lastLine()).length};

                    /*
                     * Search and replace:
                     */

                    // "Replace all"
                    if (replaceAll) {
                        let content = cm.getValue();

                        // Nothing found?
                        if (content.search(regexPattern) < 0) {
                            await context.postMessage({
                                name: "alert",
                                text: `"${pattern}" couldn't be found. Nothing was replaced.`,
                                title: "No occurences found"
                            });
                            return;
                        }

                        content = content.replace(regexPattern, replacement);
                        cm.setValue(content);

                        // Set previous cursor position:
                        cm.setCursor(cursor);

                    // "Replace next"
                    } else {
                        let content = cm.getRange(cursor, lastPos);

                        /*
                         * Determine next cursor position:
                         */

                        // Get the index of substring `content`:
                        let index = content.search(regexPattern);

                        // Nothing found?
                        if (index < 0) {
                            await context.postMessage({
                                name: "alert",
                                text: `"${pattern}" couldn't be found. Nothing was replaced.`,
                                title: "No more occurences found"
                            });
                            return;
                        }

                        // Get the line number by counting "\n" and adding it to the current line number:
                        let curLine = cursor.line + (content.substring(0, index).match(/\n/g) || []).length;

                        // Get the column (or char) by getting the length of the substring between the last "\n" and the index:
                        let curCh = content.substring(content.substring(0, index).lastIndexOf("\n") + 1, index).length;

                        // If the cursor is on the same line, add the remaining length before the cursor:
                        if (curLine == cursor.line)
                            curCh += cursor.ch;

                        // Create the selection range:
                        let newSelection: Range = {
                            from: {
                                line: curLine,
                                ch: curCh
                            } as Position,
                            to: {
                                line: curLine,
                                ch: curCh + replacement.length
                            } as Position
                        }

                        /*
                         * Search and replace
                         */
                        content = content.replace(regexPattern, replacement);
                        cm.replaceRange(content, cursor, lastPos);
                        
                        // Set the selection (what has been replaced):
                        //cm.setCursor(newSelection.to);
                        cm.setSelection(newSelection.from, newSelection.to);
                    }

                    // Needed for the cursor to be visible:
                    cm.refresh();
                    cm.focus();
                }
            });
        }

        return { plugin }
    }
}