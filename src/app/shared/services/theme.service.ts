import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  signal,
  effect,
  inject,
  DOCUMENT,
  PLATFORM_ID,
  REQUEST,
  TransferState,
  makeStateKey,
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
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly request = inject(REQUEST, { optional: true });
  private readonly transferState = inject(TransferState);
  private readonly storageKey = 'currentTheme';

  readonly themeMode = signal<ThemeMode>(this.readInitialTheme());

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.themeMode());
    });
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);

    if (this.isBrowser) {
      const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
      this.document.cookie = `${this.storageKey}=${mode}; Path=/; Max-Age=34560000; SameSite=Lax${secure}`;
    }
  }

  private readInitialTheme(): ThemeMode {
    if (this.isBrowser && this.transferState.hasKey(THEME_MODE_KEY)) {
      const mode = this.transferState.get(THEME_MODE_KEY, ThemeMode.System);
      this.transferState.remove(THEME_MODE_KEY);
      return mode;
    }

    const cookies = this.isBrowser
      ? this.document.cookie
      : (this.request?.headers.get('cookie') ?? '');
    const saved = cookies
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${this.storageKey}=`))
      ?.slice(this.storageKey.length + 1);
    const mode = saved === ThemeMode.Light || saved === ThemeMode.Dark ? saved : ThemeMode.System;

    if (!this.isBrowser) {
      this.transferState.set(THEME_MODE_KEY, mode);
    }

    return mode;
  }
}
