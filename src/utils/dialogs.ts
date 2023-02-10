import joplin from "api";
import { ButtonSpec, DialogResult } from "api/types";
import { escapeRegExp, escapeReplacement } from "./utils";

/** Wrapper around Joplin's dialogs API. */
export class Dialog {
    private id: string;
    private viewHandle: string;
    private dialogResult: DialogResult;
    private defaultFormData: Object;
    private positiveIds: string[];
    public template: string;

    constructor() {
        this.id = this.makeid(32);
        this.defaultFormData = {};
        this.positiveIds = ["ok", "yes", "accept"];
        this.template = "";
    }

    public async create() {
        this.viewHandle = await joplin.views.dialogs.create(this.id);
        // await joplin.views.dialogs.addScript(this.viewHandle, './webview_dialog.css');
    }

    /**
     * Adds and loads new JS or CSS files into the dialog.
     * @see {@link joplin.views.dialogs.addScript}
     * @param script 
     */
    public async addScript(script: string) {
        await joplin.views.dialogs.addScript(this.viewHandle, script);
    }

    /**
     * Sets the dialog HTML content
     * @see {@link joplin.views.dialogs.setHtml}
     * @param html
     */
    public async setHtml(html: string) {
        return await joplin.views.dialogs.setHtml(this.viewHandle, html);
    }

    /**
     * Uses a template for the HTML content and inserts variables.
     */
    public async useTemplate(obj: {} = {}) {
        let html = this.template;
        for (var key of Object.keys(obj)) {
            html = html.replace(
                new RegExp(`\{${escapeRegExp(key)}\}`, "g"),
                typeof obj[key] == "string" ? escapeReplacement(obj[key]).replace(/\r?\n/g, "<br>") : escapeReplacement(obj[key].toString()));
        }
        return await this.setHtml(html);
    }

    /**
     * Sets the dialog buttons.
     * @see {@link joplin.views.dialogs.setButtons}
     * @param buttons
     */
    public async setButtons(buttons: ButtonSpec[]) {
        return await joplin.views.dialogs.setButtons(this.viewHandle, buttons);
    }

    /**
     * Adds IDs of dialog buttons that should be interpreted as 'true'.
     */
    public addPositiveIds(...ids: string[]) {
        this.positiveIds.push(...ids);
    }

    /**
     * Opens the dialog
     * @see {@link joplin.views.dialogs.open}
     */
    public async open(): Promise<DialogResult> {
        this.dialogResult = await joplin.views.dialogs.open(this.viewHandle);
        return this.dialogResult;
    }

    /**
     * Returns the last (raw) dialog result.
     */
    public getDialogResult(): DialogResult {
        return this.dialogResult;
    }

    /**
     * Returns the last dialog result that has been prepared.
     */
    public getPreparedDialogResult(defaultFormData: Object = this.defaultFormData): {id: string, confirm: boolean, formData: Object} {
        return {
            "id": this.getPressedButton(),
            "confirm": this.getAnswer(),
            "formData": this.getFormData(defaultFormData)
        }
    }

    public getDefaultFormData() {
        return this.defaultFormData;
    }

    public setDefaultFormData(defaultFormData: Object = {}) {
        this.defaultFormData = defaultFormData;
    }

    /**
     * By default, Joplin only returns form data that has been changed. This function returns a complete form data with defaults filled in.
     * @see setDefaultFormData
     * @see getDefaultFormData
     */
    public getFormData(defaultFormData: Object = this.defaultFormData): Object {
        let formData = Object.assign({}, defaultFormData);
        if (this.dialogResult.formData) {
            Object.values(this.dialogResult.formData).forEach(obj => Object.assign(formData, obj));
        }
        return formData;
    }

    /**
     * Returns the ID of the last pressed button.
     */
    public getPressedButton(): string {
        return this.dialogResult.id;
    }

    /**
     * Returns a boolean depending on whether the ID of the last pressed button is in `Dialog.positiveIds`.
     * @see {addPositiveIds} to add IDs that should be interpreted as `true`
     */
    public getAnswer(): boolean {
        return this.positiveIds.includes(this.getPressedButton());
    }

    private makeid(length) {
        // https://stackoverflow.com/a/1349426
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}