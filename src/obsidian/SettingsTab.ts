import { clamp, msToSeconds, safeSecondsToMs } from "src/utils/utils";
import TldrawPlugin from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";
import {
	DEFAULT_SAVE_DELAY,
	MAX_SAVE_DELAY,
	MIN_SAVE_DELAY,
} from "src/utils/constants";

export type ThemePreference = "match-theme" | "dark" | "light";

export interface TldrawPluginSettings {
	folder: string;
	saveFileDelay: number; // in seconds
	newFilePrefix: string;
	newFileTimeFormat: string;
	toolSelected: string;
	themeMode: ThemePreference;
	gridMode: boolean;
	snapMode: boolean;
	debugMode: boolean;
	focusMode: boolean;
}

export const DEFAULT_SETTINGS: TldrawPluginSettings = {
	folder: "tldraw",
	saveFileDelay: 0.5,
	newFilePrefix: "Tldraw ",
	newFileTimeFormat: "YYYY-MM-DD h.mmA",
	toolSelected: "select",
	themeMode: "light",
	gridMode: false,
	snapMode: false,
	debugMode: false,
	focusMode: false,
};

export class SettingsTab extends PluginSettingTab {
	plugin: TldrawPlugin;

	constructor(app: App, plugin: TldrawPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const header = new Setting(containerEl).infoEl;

		header.createEl("h4", {
			text: "Tldraw Settings",
			cls: "tldraw-settings-header",
		});

		new Setting(containerEl)
			.setName("Save Folder")
			.setDesc("The directory that tldraw files will be created in.")
			.addText((text) =>
				text
					.setPlaceholder("root")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value;

						await this.plugin.saveSettings();
					})
			);

		const defaultDelay = msToSeconds(DEFAULT_SAVE_DELAY);
		const minDelay = msToSeconds(MIN_SAVE_DELAY);
		const maxDelay = msToSeconds(MAX_SAVE_DELAY);

		const saveDelaySetting = new Setting(containerEl)
			.setName("Save Delay")
			.setDesc(
				`The delay in seconds to automatically save after a change has been made to a tlraw drawing. Must be a value between ${minDelay} and ${maxDelay} (1 hour). Requires reloading any tldraw files you may have open in a tab.`
			)
			.addText((text) =>
				text
					.setPlaceholder(`${defaultDelay}`)
					.setValue(`${this.plugin.settings.saveFileDelay}`)
					.onChange(async (value) => {
						const parsedValue = parseInt(value);

						this.plugin.settings.saveFileDelay = clamp(
							isNaN(parsedValue) ? defaultDelay : parsedValue,
							minDelay,
							maxDelay
						);

						await this.plugin.saveSettings();
					})
			);

		saveDelaySetting.descEl.createEl("code", {
			cls: "default-code",
			text: `DEFAULT: [${DEFAULT_SETTINGS.saveFileDelay}]`,
		});

		const filePrefixSettings = new Setting(containerEl)
			.setName("New File Prefix")
			.setDesc(
				"When creating a new tldraw file, the file name will automatically prepend the prefix. Can be left empty, however if both the Prefix and Time Format are empty, it will use the defaults to name the file."
			)
			.addText((text) =>
				text
					.setPlaceholder("Prefix")
					.setValue(this.plugin.settings.newFilePrefix)
					.onChange(async (value) => {
						this.plugin.settings.newFilePrefix = value;
						await this.plugin.saveSettings();
					})
			);

		filePrefixSettings.descEl.createEl("code", {
			text: `DEFAULT: [${DEFAULT_SETTINGS.newFilePrefix} ]`,
			cls: "default-code",
		});

		const timeFormatSetting = new Setting(containerEl)
			.setName("New File Time Format")
			.setDesc(
				"When creating a new tldraw file, this represents the time format that will get appended to the file name. Can be left empty, however if both the Prefix and Time Format are empty, it will use the defaults to name the file. The meanings of each token can be found here: "
			)
			.addText((text) =>
				text
					.setPlaceholder("Time Format")
					.setValue(this.plugin.settings.newFileTimeFormat)
					.onChange(async (value) => {
						this.plugin.settings.newFileTimeFormat = value;
						await this.plugin.saveSettings();
					})
			);

		timeFormatSetting.descEl.createEl("a", {
			href: "https://momentjs.com/docs/#/displaying/format/",
			text: "https://momentjs.com/docs/#/displaying/format/",
		});

		timeFormatSetting.descEl.createEl("code", {
			cls: "default-code",
			text: `DEFAULT: [${DEFAULT_SETTINGS.newFileTimeFormat}]`,
		});

		const themeSetting = new Setting(containerEl)
			.setName("Theme")
			.setDesc(
				"When opening a tldraw file, this setting decides what theme should be applied. Make sure you pick well as this setting also determines your personality."
			)
			.addDropdown((cb) => {
				cb.addOption("light", "Light Theme")
					.addOption("dark", "Dark Theme")
					.addOption("match-theme", "Match Theme")
					.setValue(this.plugin.settings.themeMode)
					.onChange(async (value) => {
						this.plugin.settings.themeMode =
							value as ThemePreference;
						await this.plugin.saveSettings();
					});
			});

		const descriptionEl = themeSetting.descEl.createEl("dl");
		descriptionEl.createEl("dt", {
			text: "Light Theme",
			cls: "theme-term",
		});
		descriptionEl.createEl("dd", {
			text: "The default theme which looks like a whiteboard for those who enjoy the smell of markers.",
			cls: "theme-definition",
		});
		descriptionEl.createEl("dt", { text: "Dark Theme", cls: "theme-term" });
		descriptionEl.createEl("dd", {
			text: "The dark theme looks like the a blackboard for those who don't mind white chalk on their hands.",
			cls: "theme-definition",
		});
		descriptionEl.createEl("dt", {
			text: "Match Theme",
			cls: "theme-term",
		});
		descriptionEl.createEl("dd", {
			text: "Matches the tldraw's theme with obsidian's theme for those who prefer consistency above all else.",
			cls: "theme-definition",
		});

		new Setting(containerEl)
			.setName("Default Tool")
			.setDesc(
				"When opening a tldraw file, this setting decides which tool should be selected."
			)
			.addDropdown((cb) => {
				cb.addOption("select", "Select")
					.addOption("hand", "Hand")
					.addOption("draw", "Draw")
					.addOption("text", "Text")
					.addOption("eraser", "Eraser")
					.addOption("highlight", "Highlight")
					.addOption("rectangle", "Rectangle")
					.addOption("ellipse", "Ellipse")
					.setValue(this.plugin.settings.toolSelected)
					.onChange(async (value) => {
						this.plugin.settings.toolSelected =
							value as ThemePreference;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Grid Mode")
			.setDesc(
				"When opening tldraw files, this setting determines whether grid mode is enabled. Keep in mind that enabling grid mode will both show a grid and enforce snap-to-grid functionality."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.gridMode);
				cb.onChange(async (value) => {
					this.plugin.settings.gridMode = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Snap mode")
			.setDesc(
				"When opening tldraw files, this setting determines whether snap mode is enabled. Snap mode is a feature that places guides on shapes as you move them, ensuring they align with specific points or positions for precise placement."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.snapMode);
				cb.onChange(async (value) => {
					this.plugin.settings.snapMode = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Focus Mode")
			.setDesc(
				"When opening tldraw files, this setting determines whether to launch tldraw in focus mode. Great if you like to use tldraw to quickly jot something down."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.focusMode);
				cb.onChange(async (value) => {
					this.plugin.settings.focusMode = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Debug Mode")
			.setDesc(
				"When opening tldraw files, this setting toggles the tldraw debug mode. Debug mode is useful for the developer."
			)
			.addToggle((cb) => {
				cb.setValue(this.plugin.settings.debugMode);
				cb.onChange(async (value) => {
					this.plugin.settings.debugMode = value;
					await this.plugin.saveSettings();
				});
			});
	}
}
