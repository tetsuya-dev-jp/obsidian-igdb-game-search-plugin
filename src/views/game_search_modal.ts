import { IgdbApi } from '@apis/igdb_api';
import { GameEntry } from '@models/game.model';
import GameSearchPlugin from '@src/main';
import { ButtonComponent, Modal, Notice, Setting, TextComponent } from 'obsidian';

export class GameSearchModal extends Modal {
  private readonly SEARCH_BUTTON_TEXT = 'Search';
  private readonly REQUESTING_BUTTON_TEXT = 'Requesting...';
  private readonly igdbApi: IgdbApi;
  private isBusy = false;
  private okBtnRef?: ButtonComponent;

  constructor(
    private plugin: GameSearchPlugin,
    private query: string,
    private callback: (error: Error | null, result?: GameEntry[]) => void,
  ) {
    super(plugin.app);
    this.igdbApi = new IgdbApi(plugin.settings, () => plugin.saveSettings());
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Search Game' });
    contentEl.createDiv({ cls: 'game-search-plugin__search-modal--input' }, el => {
      new TextComponent(el)
        .setValue(this.query)
        .setPlaceholder('Search by game title')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener('keydown', event => event.key === 'Enter' && !event.isComposing && this.searchGame());
    });
    new Setting(this.contentEl).addButton(btn => {
      this.okBtnRef = btn
        .setButtonText(this.SEARCH_BUTTON_TEXT)
        .setCta()
        .onClick(() => this.searchGame());
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private setBusy(busy: boolean): void {
    this.isBusy = busy;
    this.okBtnRef?.setDisabled(busy).setButtonText(busy ? this.REQUESTING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
  }

  private async searchGame(): Promise<void> {
    if (!this.query.trim()) return void new Notice('No query entered.');
    if (this.isBusy) return;

    this.setBusy(true);
    try {
      const searchResults = await this.igdbApi.getByQuery(this.query);
      if (!searchResults.length) return void new Notice(`No results found for "${this.query}"`);
      this.callback(null, searchResults);
    } catch (err) {
      this.callback(err as Error);
    } finally {
      this.setBusy(false);
      this.close();
    }
  }
}
