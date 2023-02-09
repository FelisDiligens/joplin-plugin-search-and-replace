import joplin from "api";
import { ContentScriptType, MenuItemLocation } from "api/types";
import { getPanelHTML } from "./panel";
import { Dialog } from "./utils/dialogs";
import { getEditorState, getTheme } from "./utils/joplinUtils";
import { Panel } from "./utils/panels";
import { sanitizeHTML } from "./utils/utils";

let dialogAlert: Dialog;
let panel: Panel;
let selectedText: string = "";

joplin.plugins.register({
    onStart: async function () {
        /*
            Create 'Search and Replace' panel
        */
        panel = new Panel();
        panel.addScript("./webview_panel.css");
        panel.addScript("./webview_panel.js");
        panel.setHtml(await getPanelHTML());

        /*
            React to messages that are sent from the panel:
        */
        panel.onMessage(async (message) => {
            if (message.name == "SARPanel.close") {
                panel.hide();
            } else if (message.name == "selectedText") {
                // Return selected text that we saved previously, when opening the panel:
                return selectedText;
                // return await joplin.commands.execute("selectedText");
            } else if (message.name == "getEditorState") {
                return getEditorState();
            } else if (message.name.startsWith("SARPlugin.")) {
                // Send any "SARPlugin..." messages directly to the CodeMirror editor plugin:
                return await joplin.commands.execute('editor.execCommand', {
					name: message.name,
					args: [message.form],
				});
            } else {
                // Unknown message, show message box:
                alert(JSON.stringify(message, null, 4));
            }
        });

        /*
			Create alert dialog
		*/
        dialogAlert = new Dialog();
        await dialogAlert.create();
        await dialogAlert.setButtons([{ id: "ok" }]);
        dialogAlert.template = `
            <div>
                <h3>{title}</h3>
                <p>{text}</p>
            </div>
        `;

        /*
			Register command: "Edit -> Search and Replace (Ctrl+H)"
		*/
        await joplin.commands.register({
            name: "searchAndReplace",
            label: "Search and replace",
            enabledCondition:
                "markdownEditorPaneVisible && !richTextEditorVisible",
            execute: async () => {
                // Save 'selectedText' for later:
                selectedText = await joplin.commands.execute("selectedText");

                // If panel not visible:
                let isVisible = await panel.visible();
                if (!isVisible) {
                    panel.setHtml(await getPanelHTML());

                    // Open panel:
                    await panel.show();
                }

                // Set the text in the panel to the selectedText:
                if (selectedText.length > 0) {
                    panel.postMessage({ name: "SARPanel.setText", value: selectedText });
                }
            },
        });

        // Add command to 'Edit' menu:
        joplin.views.menuItems.create(
            "Search and replace",
            "searchAndReplace",
            MenuItemLocation.Edit,
            { accelerator: "CmdOrCtrl+H" }
        );

        /*
            React to messages that are sent from the CodeMirror plugin:
		*/
        await joplin.contentScripts.onMessage(
            "SearchAndReplace",
            async (message: any) => {
                switch (message.name) {
                    case "alert":
                        dialogAlert.useTemplate({
                            text: sanitizeHTML(message.text),
                            title: message.title,
                        });
                        await dialogAlert.open();
                        return dialogAlert.getPreparedDialogResult();
                    default:
                        return "Error: " + message + " is not a valid message";
                }
            }
        );

        /*
			Register CodeMirror content script (or plugin):
		*/
        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            "SearchAndReplace",
            "./cmPlugin.js"
        );
    },
});