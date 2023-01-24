import joplin from "api";
import { ButtonSpec, DialogResult } from "api/types";

/** Wrapper around Joplin's dialogs API. */
export class Dialog {
    private id: string;
    private viewHandle: string;
    private dialogResult: DialogResult;
    private defaultFormData: Object;
    private positiveIds: string[];
    public template: string;

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

    constructor() {
        this.id = this.makeid(32);
        this.defaultFormData = {};
        this.positiveIds = ["ok", "yes", "accept"];
        this.template = "";
    }

    public async create() {
        this.viewHandle = await joplin.views.dialogs.create(this.id);
        await joplin.views.dialogs.addScript(this.viewHandle, './webview_dialog.css');
    }

    /**
     * Sets the dialog HTML content
     * @see {@link joplin.views.dialogs.setHtml}
     * @param html
     */
    public async setHtml(html: string) {
        return await joplin.views.dialogs.setHtml(this.viewHandle, html);
    }

    public async useTemplate(obj: {} = {}) {
        let html = this.template;
        for (var key of Object.keys(obj)) {
            html = html.replace(
                new RegExp(`\{${key}\}`, "g"),
                typeof obj[key] == "string" ? obj[key].replace(/\r?\n/g, "<br>") : obj[key].toString());
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

    public getDialogResult(): DialogResult {
        return this.dialogResult;
    }

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

    public getFormData(defaultFormData: Object = this.defaultFormData): Object {
        let formData = Object.assign({}, defaultFormData);
        if (this.dialogResult.formData) {
            Object.values(this.dialogResult.formData).forEach(obj => Object.assign(formData, obj));
        }
        return formData;
    }

    public getPressedButton(): string {
        return this.dialogResult.id;
    }

    public getAnswer(): boolean {
        return this.positiveIds.includes(this.getPressedButton());
    }
}