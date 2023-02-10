export function getDialogHTML() {
    return `
    <div>
        <h3>Search and replace</h3>
        <form>
            <table>
                <tr>
                    <td><input class="expand" type="text" name="pattern-txt" value="{pattern}" placeholder="Find"></td>
                </tr>
                <tr>
                    <td><input class="expand" type="text" name="replacement-txt" value="{replacement}" placeholder="Replace"></td>
                </tr>
            </table>
            <table>
                <tr>
                    <td>Options:</td>
                    <td>
                        <input type="checkbox" id="wrap-chk" name="wrap-chk" {wrap}><label for="wrap-chk">Wrap around</label><br>
                        <input type="checkbox" id="matchcase-chk" name="matchcase-chk" {matchcase}><label for="matchcase-chk">Match case</label><br>
                        <input type="checkbox" id="matchwholeword-chk" name="matchwholeword-chk" {matchwholeword}><label for="matchwholeword-chk">Match whole words only</label><br>
                        <input type="checkbox" id="preservecase-chk" name="preservecase-chk" {preservecase}><label for="preservecase-chk">Preserve case</label>
                    </td>
                    <td>
                        <input type="radio" id="useliteralsearch-rad" name="matchmethod" value="literal" {matchmethod-literal}><label for="useliteralsearch-rad" checked>Literal search</label><br>
                        <input type="radio" id="usewildcards-rad" name="matchmethod" value="wildcards" {matchmethod-wildcards}><label for="usewildcards-rad">Use Wildcards</label><br>
                        <input type="radio" id="useregex-rad" name="matchmethod" value="regex" {matchmethod-regex}><label for="useregex-rad">Use Regular Expression</label>
                    </td>
                </tr>
            </table>
        </form>
        <!--<p class="small-text">
            If you enable regular expressions, it's going to use JavaScript regex. See MDN docs to learn more.
        </p>-->
    </div>`;
}