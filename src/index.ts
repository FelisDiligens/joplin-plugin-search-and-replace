import joplin from "api";
import { ContentScriptType, MenuItemLocation } from "api/types";
import { getDialogHTML } from "./dialog";
import { getPanelHTML } from "./panel";
import { getSettings, registerAllSettings } from "./settings";
import { Dialog } from "./utils/dialogs";
import { getEditorState } from "./utils/joplinUtils";
import { Panel } from "./utils/panels";
import { prepareRegex, sanitizeHTML } from "./utils/utils";

let dialogAlert: Dialog;
let dialogSAR: Dialog;
let dialogSARLastFormData;
let panel: Panel;
let selectedText: string = "";

joplin.plugins.register({
    onStart: async function () {
        // Register this plugin's settings, so the user can access them:
        await registerAllSettings();

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
            } else if (message.name == "getPreviewRegex") {
                try {
                    return {
                        "regex": prepareRegex(message.form.searchPattern, message.form.options),
                        "error": null
                    }
                } catch (exp) {
                    return {
                        "regex": null,
                        "error": exp
                    }
                }
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
			Create "Search & replace" dialog
		*/
		dialogSAR = new Dialog();
		await dialogSAR.create();
        await dialogSAR.addScript("./webview_dialog.css");
        await dialogSAR.setButtons([
			{id: "findPrevious", title: "Find previous"},
			{id: "findNext", title: "Find next"},
			{id: "replace", title: "Replace"},
			{id: "replaceAll", title: "Replace all"},
			{id: "cancel"}
		]);
		dialogSAR.addPositiveIds("findNext", "findPrevious", "replace", "replaceAll");
		dialogSAR.template = getDialogHTML();
        dialogSAR.setDefaultFormData({
            "pattern-txt": "",
            "replacement-txt": "",
            "wrap-chk": "off",
            "matchcase-chk": "off",
            "matchwholeword-chk": "off",
            "preservecase-chk": "off",
            "matchmethod": "literal"
        });
        dialogSARLastFormData = {
            ...dialogSAR.getDefaultFormData(),
            "matchcase-chk": "on"
        };

        /*
			Create alert dialog
		*/
        dialogAlert = new Dialog();
        await dialogAlert.create();
        await dialogAlert.addScript("./webview_dialog.css");
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

                // Get the user preference (panel or dialog)
                let guiPreference = (await getSettings()).SARGUIPreference;

                /*
                    Open a panel:
                */
                if (guiPreference == "panel") {
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

                /*
                    Open a dialog:
                */
                } else if (guiPreference == "dialog") {
                    // "Recall" last form data:
					dialogSAR.useTemplate({
						"pattern": selectedText.length > 0 ? sanitizeHTML(selectedText) : sanitizeHTML(dialogSARLastFormData["pattern-txt"]),
						"replacement": sanitizeHTML(dialogSARLastFormData["replacement-txt"]),
                        "wrap": dialogSARLastFormData["wrap-chk"] == "on" ? "checked" : "",
                        "matchcase": dialogSARLastFormData["matchcase-chk"] == "on" ? "checked" : "",
                        "matchwholeword": dialogSARLastFormData["matchwholeword-chk"] == "on" ? "checked" : "",
                        "preservecase": dialogSARLastFormData["preservecase-chk"] == "on" ? "checked" : "",
                        "matchmethod-literal": dialogSARLastFormData["matchmethod"] == "literal" ? "checked" : "",
                        "matchmethod-wildcards": dialogSARLastFormData["matchmethod"] == "wildcards" ? "checked" : "",
                        "matchmethod-regex": dialogSARLastFormData["matchmethod"] == "regex" ? "checked" : ""
					});

                    // Open the dialog:
                    await dialogSAR.open();
					let result = dialogSAR.getPreparedDialogResult();
					
					// "Memorize" form data:
					dialogSARLastFormData = result.formData;

                    if (result.confirm) {
                        let form = {
                            searchPattern: result.formData["pattern-txt"],
                            replacement: result.formData["replacement-txt"],
                            options: {
                                wrapAround: result.formData["wrap-chk"] == "on",
                                matchCase: result.formData["matchcase-chk"] == "on",
                                matchWholeWord: result.formData["matchwholeword-chk"] == "on",
                                matchMethod: result.formData["matchmethod"],
                                preserveCase: result.formData["preservecase-chk"] == "on"
                            },
                        }

                        await joplin.commands.execute('editor.execCommand', {
                            name: "SARPlugin." + result.id,
                            args: [form],
                        });
                    }
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