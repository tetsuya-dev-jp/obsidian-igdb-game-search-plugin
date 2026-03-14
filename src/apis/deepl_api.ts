import { ConfigurationError, apiRequest } from '@apis/base_api';
import { GameEntry } from '@models/game.model';
import { GameSearchPluginSettings } from '@settings/settings';
import { isEnglishTargetLanguage, resolveTranslationTargetLanguage } from '@utils/deepl_languages';
import { DeepLTranslationResponse } from './models/deepl_response';

export const DEEPL_FREE_TRANSLATE_URL = 'https://api-free.deepl.com/v2/translate';
export const DEEPL_PRO_TRANSLATE_URL = 'https://api.deepl.com/v2/translate';

type TranslatableGameField = 'summary' | 'storyline';

export class DeepLApi {
  constructor(private readonly settings: GameSearchPluginSettings) {}

  async translateGameEntry(game: GameEntry): Promise<GameEntry> {
    if (!this.settings.enableTranslation) {
      return game;
    }

    const targetLanguage = resolveTranslationTargetLanguage(this.settings.translationTargetLanguage);
    if (!targetLanguage || isEnglishTargetLanguage(targetLanguage)) {
      return game;
    }

    const apiKey = this.settings.deeplApiKey.trim();
    if (!apiKey) {
      throw new ConfigurationError('Please set your DeepL API key in the plugin settings.');
    }

    const fields = this.getTranslatableFields(game);
    if (!fields.length) {
      return game;
    }

    const response = await apiRequest<DeepLTranslationResponse>(this.getTranslateUrl(apiKey), {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: fields.map(([, value]) => value),
        target_lang: targetLanguage,
      }),
    });

    const translatedGame = { ...game };
    fields.forEach(([key, originalValue], index) => {
      translatedGame[key] = response.translations[index]?.text?.trim() || originalValue;
    });

    return translatedGame;
  }

  private getTranslateUrl(apiKey: string): string {
    return apiKey.endsWith(':fx') ? DEEPL_FREE_TRANSLATE_URL : DEEPL_PRO_TRANSLATE_URL;
  }

  private getTranslatableFields(game: GameEntry): Array<[TranslatableGameField, string]> {
    const fields: Array<[TranslatableGameField, string]> = [];

    (['summary', 'storyline'] as TranslatableGameField[]).forEach(key => {
      const value = game[key]?.trim() ?? '';
      if (value) {
        fields.push([key, value]);
      }
    });

    return fields;
  }
}
