import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  REQUEST,
  signal,
  TransferState,
} from '@angular/core';

import EN from '../translations/en.json';
import { Language } from '../translations/language.types';
import type { LanguagePreference } from '../translations/language.types';
import RU from '../translations/ru.json';

const qualityPattern = /^q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/i;
const tagPattern = /^(?:[a-z]{1,8}(?:-[a-z0-9]{1,8})*|\*)$/i;
const LANGUAGE_KEY = makeStateKey<Language>('language');

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _request = inject(REQUEST, { optional: true });
  private readonly _transferState = inject(TransferState);
  private readonly _storageKey = 'currentLanguage';
  private readonly _language = signal<Language>(this.readInitialLanguage());
  private readonly _dictionaries = {
    [Language.English]: EN,
    [Language.Russian]: RU,
  } satisfies Record<Language, typeof EN & typeof RU>;

  readonly language = this._language.asReadonly();
  readonly translations = computed(() => {
    const currentLanguage = this.language();
    return this._dictionaries[currentLanguage];
  });

  constructor() {
    effect(() => {
      this._document.documentElement.setAttribute('lang', this.language());
    });
  }

  setLanguage(language: Language): void {
    this._language.set(language);

    if (!this._isBrowser) {
      return;
    }

    const secure = this._document.location.protocol === 'https:' ? '; Secure' : '';

    this._document.cookie = `${this._storageKey}=${language}; Path=/; Max-Age=34560000; SameSite=Lax${secure}`;
  }

  private readInitialLanguage(): Language {
    if (this._isBrowser && this._transferState.hasKey(LANGUAGE_KEY)) {
      const language = this._transferState.get(LANGUAGE_KEY, Language.English);
      this._transferState.remove(LANGUAGE_KEY);

      return language;
    }

    const language =
      this.readSavedLanguage() ??
      (this._isBrowser ? this.readBrowserLanguage() : this.readServerLanguage());

    if (!this._isBrowser) {
      this._transferState.set(LANGUAGE_KEY, language);
    }

    return language;
  }

  private readSavedLanguage(): Language | undefined {
    const cookies = this._isBrowser
      ? this._document.cookie
      : (this._request?.headers.get('cookie') ?? '');
    const saved = cookies
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${this._storageKey}=`))
      ?.slice(this._storageKey.length + 1);

    if (saved === Language.Russian || saved === Language.English) {
      return saved;
    } else return;
  }

  private resolveLanguage(languageTag?: string): Language {
    const primaryTag = languageTag?.trim().toLowerCase().split('-')[0];
    return primaryTag === Language.Russian ? Language.Russian : Language.English;
  }

  private readBrowserLanguage(): Language {
    if (!this._isBrowser) return Language.English;
    const browserNavigator = this._document.defaultView?.navigator;

    return this.resolveLanguage(browserNavigator?.languages?.[0] ?? browserNavigator?.language);
  }

  private parseLanguagePreference(value: string): LanguagePreference | undefined {
    const languageCookieParts = value.split(';').map((value) => value.trim());
    const [tagPart, qualityPart = 'q=1'] = languageCookieParts;

    if (!tagPart || languageCookieParts.length > 2) {
      return undefined;
    }

    if (tagPattern.test(tagPart) && qualityPattern.test(qualityPart)) {
      return {
        tag: tagPart,
        quality: Number(qualityPart.slice(2)),
      };
    } else {
      return undefined;
    }
  }

  private readServerLanguage(): Language {
    const acceptLanguage = this._request?.headers.get('accept-language') ?? '';
    let preferredLanguage: LanguagePreference | undefined = undefined;
    const headers = acceptLanguage.split(',');

    for (const header of headers) {
      const preference = this.parseLanguagePreference(header);
      if (!preference || preference.quality === 0) {
        continue;
      }

      if (!preferredLanguage || preference.quality > preferredLanguage.quality) {
        preferredLanguage = preference;
      }
    }

    return this.resolveLanguage(preferredLanguage?.tag);
  }
}
