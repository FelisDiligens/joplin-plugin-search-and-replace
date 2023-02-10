import joplin from "api";
import { SettingItemType } from "api/types";

/**
 * Returns all settings the user can/has set.
*/
export async function getSettings() {
	return {
		"SARGUIPreference": await joplin.settings.value('SARGUIPreference')
	}
}

/**
 * Register this plugin"s settings to Joplin.
 */
export async function registerAllSettings() {
    const section = "SAROptions";

    await joplin.settings.registerSection(section, {
        label: "Search & Replace",
        description: "Search & Replace",
        iconName: "fas fa-search"
    });

    await joplin.settings.registerSettings({
        ["SARGUIPreference"]: { 
			public: true,
			section: section,
			type: SettingItemType.String,
			isEnum: true,
			value: "panel",
			label: "GUI Preference",
			description: "If you don't like the panel, you can switch to a popup dialog instead.",
			options: {
				"panel": "Open a panel (default, recommended)",
				"dialog": "Open a dialog (like in previous versions)"
			},
		}
    });
}