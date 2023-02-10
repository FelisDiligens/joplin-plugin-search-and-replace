import joplin from "api";

/** Wrapper around Joplin's panels API. */
export class Panel {
    private id: string;
    private viewHandle: string;

    private html: string = "";
    private scripts: string[] = [];
    private callback: Function = null;

    constructor() {
        this.id = this.makeid(32);
    }

    public async create() {
        if (this.created())
            throw new Error("Panel already created!");

        // Create panel:
        this.viewHandle = await joplin.views.panels.create(this.id);
        if (this.callback != null) {
            await joplin.views.panels.onMessage(this.viewHandle, this.callback);
        }
        for (let script of this.scripts) {
            await joplin.views.panels.addScript(this.viewHandle, script);
        }
        await joplin.views.panels.setHtml(this.viewHandle, this.html);

        // Clear variables:
        this.html = "";
        this.scripts = [];
        this.callback = null;
    }

    /**
     * Adds (and loads when created) new JS or CSS files into the panel.
     * @see {@link joplin.views.panels.addScript}
     * @param script 
     */
    public async addScript(script: string) {
        if (!this.created())
            this.scripts.push(script);
        else
            await joplin.views.panels.addScript(this.viewHandle, script);
    }

    /**
     * Sets the panel webview HTML
     * @see {@link joplin.views.panels.setHtml}
     * @param html
     */
    public async setHtml(html: string) {
        if (!this.created())
            this.html = html; // Save for later.
        else
            return await joplin.views.panels.setHtml(this.viewHandle, html);
    }

    /**
     * Registers a callback that is called, when a message is sent from the webview using `webviewApi.postMessage`.
     * @see {@link joplin.views.panels.onMessage}
     * @param callback 
     */
    public async onMessage(callback: Function) {
        if (!this.created())
            this.callback = callback;
        else
            await joplin.views.panels.onMessage(this.viewHandle, callback);
    }

    /**
     * Sends a message to the webview.
     * @see {@link joplin.views.panels.postMessage}
     * @param message 
     */
    public async postMessage(message) {
        if (!this.created())
            throw new Error("Can't post message if panel hasn't been created!");
        else
            await joplin.views.panels.postMessage(this.viewHandle, message);
    }

    /**
     * Tells whether the panel is visible or not
     * @see {@link joplin.views.panels.visible}
     */
    public async visible() {
        if (!this.created())
            return false;
        return await joplin.views.panels.visible(this.viewHandle);
    }

    /**
     * Shows the panel. Creates it, if it isn't already.
     * @see {@link joplin.views.panels.show}
     */
    public async show() {
        if (!this.created())
            await this.create();
        else {
            let isVisible = await this.visible();
            if (!isVisible)
                await joplin.views.panels.show(this.viewHandle);
        }
    }

    /**
     * Hides the panel.
     * @see {@link joplin.views.panels.hide}
     */
    public async hide() {
        let isVisible = await this.visible();
        if (isVisible)
            await joplin.views.panels.hide(this.viewHandle);
    }

    /**
     * Toggles the panel
     * @see {@link joplin.views.panels.show}
     * @param show (optional)
     */
    public async toggle() {
        let isVisible = await this.visible();
        if (isVisible)
            await this.hide();
        else
            await this.show();
    }

    /**
     * Tells whether the panel has been created or not
     */
    public created() {
        return !!this.viewHandle;
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