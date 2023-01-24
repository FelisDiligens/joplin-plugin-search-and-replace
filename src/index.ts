import joplin from 'api';
import { ContentScriptType, MenuItemLocation } from 'api/types';
import { Dialog } from './dialogs';

let dialogAlert;
let dialogSearchAndReplace;
let dialogLastFormData;

joplin.plugins.register({
	onStart: async function() {
		/*
			Create "Search & replace" dialog
		*/
		dialogSearchAndReplace = new Dialog();
		await dialogSearchAndReplace.create();
        await dialogSearchAndReplace.setButtons([
			{id: "replaceNext", title: "Replace next"},
			{id: "replaceAll", title: "Replace all"},
			{id: "cancel"}
		]);
		dialogSearchAndReplace.addPositiveIds("replaceNext", "replaceAll");
		dialogSearchAndReplace.template = `
            <div>
                <h3>Search and replace</h3>
                <form>
                    <table>
                        <tr>
                            <td>Search:</td>
                            <td><input class="expand" type="text" name="pattern" value="{pattern}" placeholder="Search pattern..."></td>
                        </tr>
                        <tr>
                            <td>Replace:</td>
                            <td><input class="expand" type="text" name="replacement" value="{replacement}" placeholder="Replacement text..."></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <input type="checkbox" id="useregex" name="useregex" {useregex}><label for="useregex">Use Regular Expression</label>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <input type="checkbox" id="caseinsensitive" name="caseinsensitive" {caseinsensitive}><label for="caseinsensitive">Case insensitive</label>
                            </td>
                        </tr>
                    </table>
                </form>
				<p class="small-text">
					If you enable regular expressions, it's going to use JavaScript regex. See MDN docs to learn more.
				</p>
            </div>
        `;
		dialogSearchAndReplace.setDefaultFormData({
            "pattern": "",
            "replacement": "",
            "useregex": "off",
            "caseinsensitive": "off"
        });
        dialogLastFormData = dialogSearchAndReplace.getDefaultFormData();

		/*
			Create alert dialog
		*/
		dialogAlert = new Dialog();
        await dialogAlert.create();
        await dialogAlert.setButtons([{id: "ok"}]);
        dialogAlert.template = `
            <div>
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
        `;

		/*
			Register command
		*/
		await joplin.commands.register({
            name: "searchAndReplace",
            label: "Search and replace",
            enabledCondition: 'markdownEditorPaneVisible && !richTextEditorVisible',
            execute: async () => {
				await joplin.commands.execute('editor.execCommand', { name: "searchAndReplace", });
			}
        });
		joplin.views.menuItems.create("Search and replace", "searchAndReplace", MenuItemLocation.Edit, { accelerator: "CmdOrCtrl+H" });

		/*
			Register message
		*/
		await joplin.contentScripts.onMessage("SearchAndReplace", async (message: any) => {
            switch (message.name) {
                case "openDialog":
					// "Recall" last form data:
					dialogSearchAndReplace.useTemplate({
						"pattern": dialogLastFormData.pattern,
						"replacement": dialogLastFormData.replacement,
						"useregex": dialogLastFormData.useregex == "on" ? "checked" : "",
						"caseinsensitive": dialogLastFormData.caseinsensitive == "on" ? "checked" : ""
					});

					await dialogSearchAndReplace.open();
					let result = dialogSearchAndReplace.getPreparedDialogResult();
					
					// "Memorize" form data:
					dialogLastFormData = result.formData;

					return result;
				case "alert":
					dialogAlert.useTemplate({
						"text": message.text,
						"title": message.title
					});
					await dialogAlert.open();
					return dialogAlert.getPreparedDialogResult();
                default:
                    return "Error: " + message + " is not a valid message";
            }
        });

		/*
			Register CodeMirror script
		*/
		await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            "SearchAndReplace",
            './cmPlugin.js'
        );
	},
});
