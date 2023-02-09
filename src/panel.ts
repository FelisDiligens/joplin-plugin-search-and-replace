import { getTheme } from "./utils/joplinUtils";

export async function getPanelHTML() {
    let theme = await getTheme();
    let iconColor = theme.type == "dark" ? "white" : "black";
    return `
    <div>
        <a href="#" id="close-btn"><i class="fas fa-times"></i> Close</a>
        <h3>Search and replace</h3>
        <p id="warning-mdeditor">Please return to the markdown editor.</p>
        <table>
            <tr>
                <td><input type="text" id="pattern-txt" placeholder="Find"></td>
                <td>
                    <button id="findprevious-btn" title="Previous"><i class="fas fa-chevron-up"></i></button> <!-- fa-arrow-up fa-chevron-circle-up -->
                    <button id="findnext-btn" title="Next"><i class="fas fa-chevron-down"></i></button> <!-- fa-arrow-down fa-chevron-circle-down -->
                </td>
            </tr>
            <tr>
                <td><input type="text" id="replacement-txt" placeholder="Replace"></td>
                <td>
                    <button id="replace-btn" title="Replace">
                        <!-- Icon source: https://uxwing.com/find-and-replace-icon/ -->
                        <svg style="width: 16px; display: inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 113.02">
                            <path fill="${iconColor}" d="M25.16,45A39.86,39.86,0,0,0,40.38,71.5a39.18,39.18,0,0,0,5.12,3.35,21,21,0,0,0,3.61-5,17.87,17.87,0,0,0,1-2.56,30.92,30.92,0,1,1,26.2,1.1,38.76,38.76,0,0,1,1.57,9.11,39.8,39.8,0,0,0,12.73-7.35l23,17.8,9.25-13.22L100.49,57.5A39.89,39.89,0,1,0,25.16,45ZM0,113V78.1H15.14a18.3,18.3,0,0,1,6.72,1.08,8.83,8.83,0,0,1,4.1,3,7.77,7.77,0,0,1,1.39,4.62A7.31,7.31,0,0,1,24.14,93a9,9,0,0,1-3.54,1.48v.34A8.92,8.92,0,0,1,24.7,96a7.86,7.86,0,0,1,2.93,2.88,8.3,8.3,0,0,1,1.08,4.3,9,9,0,0,1-1.48,5.1A10,10,0,0,1,23,111.74,15.23,15.23,0,0,1,16.44,113Zm9.48-7.57h4.44a5.87,5.87,0,0,0,3.57-.89,3.1,3.1,0,0,0,1.2-2.65,3.71,3.71,0,0,0-.56-2.08,3.57,3.57,0,0,0-1.6-1.3,6.15,6.15,0,0,0-2.48-.44H9.48v7.36Zm0-13.23h3.89a5.8,5.8,0,0,0,2.2-.39,3.37,3.37,0,0,0,1.49-1.13,3,3,0,0,0,.54-1.82,2.9,2.9,0,0,0-1.16-2.48,4.74,4.74,0,0,0-2.93-.87h-4v6.69ZM61.19,40.49h6.49L64.56,30.13h-.25L61.19,40.49Zm8.42,6.38H59.26l-1.81,6h-9.2l10.36-31.4H70.26l10.36,31.4H71.43l-1.82-6Zm-32,62.64-.41-30,7.58,7.44C56.06,79.36,61.28,69.7,59.65,56.87c13.93,15.63,11.11,32.87.2,44.93l7.73,7.6-30,.11Z"/>
                        </svg>
                    </button>
                    <button id="replaceall-btn" title="Replace all">
                        <!-- Icon source: https://uxwing.com/find-and-replace-icon/ -->
                        <svg style="width: 16px; display: inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 113.02">
                            <path fill="${iconColor}" d="M25.16,45A39.86,39.86,0,0,0,40.38,71.5a39.18,39.18,0,0,0,5.12,3.35,21,21,0,0,0,3.61-5,17.87,17.87,0,0,0,1-2.56,30.92,30.92,0,1,1,26.2,1.1,38.76,38.76,0,0,1,1.57,9.11,39.8,39.8,0,0,0,12.73-7.35l23,17.8,9.25-13.22L100.49,57.5A39.89,39.89,0,1,0,25.16,45ZM0,113V78.1H15.14a18.3,18.3,0,0,1,6.72,1.08,8.83,8.83,0,0,1,4.1,3,7.77,7.77,0,0,1,1.39,4.62A7.31,7.31,0,0,1,24.14,93a9,9,0,0,1-3.54,1.48v.34A8.92,8.92,0,0,1,24.7,96a7.86,7.86,0,0,1,2.93,2.88,8.3,8.3,0,0,1,1.08,4.3,9,9,0,0,1-1.48,5.1A10,10,0,0,1,23,111.74,15.23,15.23,0,0,1,16.44,113Zm9.48-7.57h4.44a5.87,5.87,0,0,0,3.57-.89,3.1,3.1,0,0,0,1.2-2.65,3.71,3.71,0,0,0-.56-2.08,3.57,3.57,0,0,0-1.6-1.3,6.15,6.15,0,0,0-2.48-.44H9.48v7.36Zm0-13.23h3.89a5.8,5.8,0,0,0,2.2-.39,3.37,3.37,0,0,0,1.49-1.13,3,3,0,0,0,.54-1.82,2.9,2.9,0,0,0-1.16-2.48,4.74,4.74,0,0,0-2.93-.87h-4v6.69ZM61.19,40.49h6.49L64.56,30.13h-.25L61.19,40.49Zm8.42,6.38H59.26l-1.81,6h-9.2l10.36-31.4H70.26l10.36,31.4H71.43l-1.82-6Zm-32,62.64-.41-30,7.58,7.44C56.06,79.36,61.28,69.7,59.65,56.87c13.93,15.63,11.11,32.87.2,44.93l7.73,7.6-30,.11Z"/>
                        </svg>
                        (all)
                    </button>
                </td>
            </tr>
        </table>
        <table>
            <!--
                TODO:
                - Find in selection
            -->
            <tr>
                <td>Regex<sup>4</sup>:</td>
                <td colspan="2">
                    <code>
                        <span id="regex-preview"></span>
                    </code>
                </td>
            </tr>
            <tr>
                <td>Options:</td>
                <td>
                    <input type="checkbox" id="wrap-chk"><label for="wrap-chk">Wrap around<sup>1</sup></label><br>
                    <input type="checkbox" id="matchcase-chk" checked><label for="matchcase-chk">Match case</label><br>
                    <input type="checkbox" id="matchwholeword-chk"><label for="matchwholeword-chk">Match whole words only</label><br>
                    <input type="checkbox" id="preservecase-chk"><label for="preservecase-chk">Preserve case</label>
                </td>
                <td>
                    <input type="radio" id="useliteralsearch-rad" name="matchoptions" checked><label for="useliteralsearch-rad" checked>Literal search</label><br>
                    <input type="radio" id="usewildcards-rad" name="matchoptions"><label for="usewildcards-rad">Use Wildcards<sup>2</sup></label><br>
                    <input type="radio" id="useregex-rad" name="matchoptions"><label for="useregex-rad">Use Regular Expression<sup>3</sup></label>
                </td>
            </tr>
        </table>
        <br>
        <details>
            <summary>Show help</summary>
            <table style="margin-top: 15px;">
                <tr>
                    <td><sup>1</sup></td>
                    <td>When you reach the end of the note, it will wrap around to the beginning of the note (and vice versa).</td>
                </tr>
                <tr>
                    <td><sup>2</sup></td>
                    <td>With wildcards enabled, you can search using <code>?</code> (any <b>one</b> character) and <code>*</code> (any characters, zero or more). Escape them like so: <code>\\*</code>, <code>\\?</code></td>
                </tr>
                <tr>
                    <td><sup>3</sup></td>
                    <td>If you enable regular expressions, it's going to use JavaScript's regex. You can also use groups in the replacement text using <code>$1</code>, <code>$2</code>, and so on. Tip: Use regex101.com</td>
                </tr>
                <tr>
                    <td><sup>4</sup></td>
                    <td>This plugin internally translates every search pattern to a regular expression. You can preview the used regex.</td>
                </tr>
            </table>
        </details>
    </div>`;
}