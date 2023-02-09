import joplin from "api";

/** Returns information about which editor the user currently uses. */
export async function getEditorState() {
    // Source: https://github.com/cqroot/joplin-outline/blob/be8f1642676e529b970aca4692157565e4dc860a/src/index.ts#L29
    const editorCodeView = await joplin.settings.globalValue('editor.codeView');
    const noteVisiblePanes = await joplin.settings.globalValue('noteVisiblePanes');
    return {
        "markdownEditor": editorCodeView && noteVisiblePanes.includes('editor'),
        "WYSIWYGEditor": !editorCodeView,
        "viewer": editorCodeView && noteVisiblePanes.includes('viewer')
    }
}

/** Returns Joplin's theme and whether it's a light or dark one. */
export async function getTheme() {
    // See: https://github.com/laurent22/joplin/blob/bef9a295818bd4321c34acdc93e84ec1faf7e5ef/packages/lib/models/Setting.ts#L818
    let theme = await joplin.settings.globalValue("theme");

    switch (theme) {
        case 1:
            return {
                id: theme,
                name: "Light",
                type: "light"
            }
        case 2:
            return {
                id: theme,
                name: "Dark",
                type: "dark"
            }
        case 3:
            return {
                id: theme,
                name: "Solarised Light",
                type: "light"
            }
        case 4:
            return {
                id: theme,
                name: "Solarised Dark",
                type: "dark"
            }
        case 5:
            return {
                id: theme,
                name: "Dracula",
                type: "dark"
            }
        case 6:
            return {
                id: theme,
                name: "Nord",
                type: "dark"
            }
        case 7:
            return {
                id: theme,
                name: "Aritim Dark",
                type: "dark"
            }
        case 22:
            return {
                id: theme,
                name: "OLED Dark",
                type: "dark"
            }
        default:
            return {
                id: theme,
                name: "Unknown",
                type: "light"
            }
    }
}