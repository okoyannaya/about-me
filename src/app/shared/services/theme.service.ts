import { isPlatformBrowser } from '@angular/common';
import {
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

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

const THEME_MODE_KEY = makeStateKey<ThemeMode>('theme-mode');

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _request = inject(REQUEST, { optional: true });
  private readonly _transferState = inject(TransferState);
  private readonly _storageKey = 'currentTheme';
  private readonly _themeMode = signal<ThemeMode>(this.readInitialTheme());

  readonly themeMode = this._themeMode.asReadonly();

  constructor() {
    effect(() => {
      this._document.documentElement.setAttribute('data-theme', this.themeMode());
    });
  }

  setTheme(mode: ThemeMode): void {
    this._themeMode.set(mode);

    if (this._isBrowser) {
      const secure = this._document.location.protocol === 'https:' ? '; Secure' : '';
      this._document.cookie = `${this._storageKey}=${mode}; Path=/; Max-Age=34560000; SameSite=Lax${secure}`;
    }
  }

  private readInitialTheme(): ThemeMode {
    if (this._isBrowser && this._transferState.hasKey(THEME_MODE_KEY)) {
      const mode = this._transferState.get(THEME_MODE_KEY, ThemeMode.System);
      this._transferState.remove(THEME_MODE_KEY);
      return mode;
    }

    const cookies = this._isBrowser
      ? this._document.cookie
      : (this._request?.headers.get('cookie') ?? '');
    const saved = cookies
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${this._storageKey}=`))
      ?.slice(this._storageKey.length + 1);
    const mode = saved === ThemeMode.Light || saved === ThemeMode.Dark ? saved : ThemeMode.System;

    if (!this._isBrowser) {
      this._transferState.set(THEME_MODE_KEY, mode);
    }

    return mode;
  }
}
