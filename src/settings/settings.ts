import { replaceDateInString } from '@utils/utils';
import { App, PluginSettingTab, Setting } from 'obsidian';
import GameSearchPlugin from '../main';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FileSuggest } from './suggesters/FileSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';

const docUrl = 'https://github.com/tetsuya-dev-jp/igdb-game-search';

export enum DefaultFrontmatterKeyType {
  snakeCase = 'Snake Case',
  camelCase = 'Camel Case',
}

export interface GameSearchPluginSettings {
  folder: string;
  fileNameFormat: string;
  frontmatter: string;
  content: string;
  useDefaultFrontmatter: boolean;
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType;
  templateFile: string;
  twitchClientId: string;
  twitchClientSecret: string;
  igdbAccessToken: string;
  igdbAccessTokenExpiresAt: number;
  openPageOnCompletion: boolean;
  showCoverImageInSearch: boolean;
  enableCoverImageSave: boolean;
  coverImagePath: string;
}

export const DEFAULT_SETTINGS: GameSearchPluginSettings = {
  folder: '',
  fileNameFormat: '{{title}}',
  frontmatter: '',
  content: '',
  useDefaultFrontmatter: true,
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType.camelCase,
  templateFile: '',
  twitchClientId: '',
  twitchClientSecret: '',
  igdbAccessToken: '',
  igdbAccessTokenExpiresAt: 0,
  openPageOnCompletion: true,
  showCoverImageInSearch: false,
  enableCoverImageSave: false,
  coverImagePath: '',
};

export class GameSearchSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: GameSearchPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.classList.add('game-search-plugin__settings');

    this.createGeneralSettings(containerEl);
    this.createTemplateFileSetting(containerEl);
    this.createIgdbSettings(containerEl);
    this.createSearchSettings(containerEl);
    this.createNoteSettings(containerEl);
  }

  private createGeneralSettings(containerEl: HTMLElement) {
    this.createHeader('General Settings', containerEl);
    this.createFileLocationSetting(containerEl);
    this.createFileNameFormatSetting(containerEl);
  }

  private createHeader(title: string, containerEl: HTMLElement) {
    const header = document.createDocumentFragment();
    header.createEl('h2', { text: title });
    return new Setting(containerEl).setHeading().setName(header);
  }

  private createFileLocationSetting(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName('New file location')
      .setDesc('New game notes will be placed here.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch (error) {
          console.error(error);
        }

        cb.setPlaceholder('Example: Games')
          .setValue(this.plugin.settings.folder)
          .onChange(async value => {
            this.plugin.settings.folder = value.trim();
            await this.plugin.saveSettings();
          });
      });
  }

  private createFileNameFormatSetting(containerEl: HTMLElement) {
    const previewEl = document.createDocumentFragment().createEl('code', {
      text: replaceDateInString(this.plugin.settings.fileNameFormat) || '{{title}}',
    });

    new Setting(containerEl)
      .setClass('game-search-plugin__settings--new_file_name')
      .setName('New file name')
      .setDesc('Enter the file name format.')
      .addSearch(cb => {
        try {
          new FileNameFormatSuggest(this.app, cb.inputEl);
        } catch (error) {
          console.error(error);
        }

        cb.setPlaceholder('Example: {{title}}')
          .setValue(this.plugin.settings.fileNameFormat)
          .onChange(async value => {
            this.plugin.settings.fileNameFormat = value.trim();
            previewEl.innerHTML = replaceDateInString(value) || '{{title}}';
            await this.plugin.saveSettings();
          });
      });

    containerEl
      .createEl('div', {
        cls: ['setting-item-description', 'game-search-plugin__settings--new_file_name_hint'],
      })
      .append(previewEl);
  }

  private createTemplateFileSetting(containerEl: HTMLElement) {
    const templateFileDesc = document.createDocumentFragment();
    templateFileDesc.createDiv({ text: 'Files will be available as templates.' });
    templateFileDesc.createEl('a', {
      text: 'Example Template',
      href: `${docUrl}#example-template`,
    });

    new Setting(containerEl)
      .setName('Template file')
      .setDesc(templateFileDesc)
      .addSearch(cb => {
        try {
          new FileSuggest(this.app, cb.inputEl);
        } catch (error) {
          console.error(error);
        }

        cb.setPlaceholder('Example: Templates/game-note')
          .setValue(this.plugin.settings.templateFile)
          .onChange(async value => {
            this.plugin.settings.templateFile = value.trim();
            await this.plugin.saveSettings();
          });
      });
  }

  private createIgdbSettings(containerEl: HTMLElement) {
    this.createHeader('IGDB Authentication', containerEl);

    new Setting(containerEl)
      .setName('Twitch Client ID')
      .setDesc('Used to request an IGDB app access token.')
      .addText(text =>
        text.setValue(this.plugin.settings.twitchClientId).onChange(async value => {
          this.plugin.settings.twitchClientId = value.trim();
          this.plugin.settings.igdbAccessToken = '';
          this.plugin.settings.igdbAccessTokenExpiresAt = 0;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Twitch Client Secret')
      .setDesc('Stored locally in plugin data and used to refresh the IGDB token.')
      .addText(text => {
        text.inputEl.type = 'password';
        text.setValue(this.plugin.settings.twitchClientSecret).onChange(async value => {
          this.plugin.settings.twitchClientSecret = value.trim();
          this.plugin.settings.igdbAccessToken = '';
          this.plugin.settings.igdbAccessTokenExpiresAt = 0;
          await this.plugin.saveSettings();
        });
      });
  }

  private createSearchSettings(containerEl: HTMLElement) {
    this.createHeader('Search Experience', containerEl);

    new Setting(containerEl)
      .setName('Show cover images in search')
      .setDesc('Display IGDB cover art in the suggestion list.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.showCoverImageInSearch).onChange(async value => {
          this.plugin.settings.showCoverImageInSearch = value;
          await this.plugin.saveSettings();
        }),
      );
  }

  private createNoteSettings(containerEl: HTMLElement) {
    this.createHeader('Note Creation', containerEl);

    new Setting(containerEl)
      .setName('Open new game note')
      .setDesc('Automatically open the created note.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.openPageOnCompletion).onChange(async value => {
          this.plugin.settings.openPageOnCompletion = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Enable cover image save')
      .setDesc('Download the selected game cover into your vault.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.enableCoverImageSave).onChange(async value => {
          this.plugin.settings.enableCoverImageSave = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Cover image folder')
      .setDesc('Folder used when cover image saving is enabled.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch (error) {
          console.error(error);
        }

        cb.setPlaceholder('Example: assets/game-covers')
          .setValue(this.plugin.settings.coverImagePath)
          .onChange(async value => {
            this.plugin.settings.coverImagePath = value.trim();
            await this.plugin.saveSettings();
          });
      });
  }
}
