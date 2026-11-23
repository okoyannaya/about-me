import { DOCUMENT, makeStateKey, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import en from '@translations/en.json';
import { Language } from '@translations/language.types';
import ru from '@translations/ru.json';

import { ThemeMode } from '../theme.service';
import { TranslationService } from '../translation.service';

enum TestPlatform {
  Browser = 'browser',
  Server = 'server',
}

const languageKey = makeStateKey<Language>('language');

function clearCookies(): void {
  for (const name of ['currentLanguage', 'currentTheme']) {
    document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
}

function configureServer(headers?: HeadersInit): void {
  TestBed.overrideProvider(PLATFORM_ID, { useValue: TestPlatform.Server });
  TestBed.overrideProvider(REQUEST, {
    useValue: headers === undefined ? null : new Request('http://localhost/', { headers }),
  });
}

describe('TranslationService', () => {
  let originalLang: string | null;

  beforeEach(() => {
    originalLang = document.documentElement.getAttribute('lang');
    clearCookies();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: TestPlatform.Browser },
        { provide: REQUEST, useValue: null },
      ],
    });
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([Language.English]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(Language.English);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    clearCookies();
    if (originalLang === null) document.documentElement.removeAttribute('lang');
    else document.documentElement.setAttribute('lang', originalLang);
  });

  it('предпочитает сохранённый язык языку браузера', () => {
    document.cookie = `currentLanguage=${Language.Russian}; Path=/`;
    expect(TestBed.inject(TranslationService).language()).toBe(Language.Russian);
  });

  it.each([
    { tags: [' RU-ru ', 'en-US'], expected: Language.Russian },
    { tags: ['fr-FR', 'ru-RU'], expected: Language.English },
  ])('выбирает $expected по первому предпочтению $tags без записи cookie', ({ tags, expected }) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(tags);
    const writeCookie = vi.spyOn(document, 'cookie', 'set');
    expect(TestBed.inject(TranslationService).language()).toBe(expected);
    expect(writeCookie).not.toHaveBeenCalled();
  });

  it.each([
    { language: 'ru-RU', expected: Language.Russian },
    { language: '', expected: Language.English },
  ])(
    'использует navigator.language или запасной английский: «$language»',
    ({ language, expected }) => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
      vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
      expect(TestBed.inject(TranslationService).language()).toBe(expected);
    },
  );

  it.each(['ru=extra', 'fr'])('игнорирует некорректную cookie «%s»', (saved) => {
    document.cookie = `currentLanguage=${saved}; Path=/`;
    expect(TestBed.inject(TranslationService).language()).toBe(Language.English);
  });

  it('при гидратации предпочитает серверный язык cookie и удаляет использованную запись', () => {
    document.cookie = `currentLanguage=${Language.English}; Path=/`;
    const state = TestBed.inject(TransferState);
    state.set(languageKey, Language.Russian);
    expect(TestBed.inject(TranslationService).language()).toBe(Language.Russian);
    expect(state.hasKey(languageKey)).toBe(false);
    expect(document.cookie).toContain(`currentLanguage=${Language.English}`);
  });

  it('на сервере предпочитает cookie заголовку и передаёт язык в TransferState', () => {
    configureServer({
      cookie: `other=value; currentLanguage=${Language.Russian}; another=value`,
      'accept-language': Language.English,
    });
    const readCookie = vi.spyOn(document, 'cookie', 'get');
    const readLanguages = vi.spyOn(navigator, 'languages', 'get');
    expect(TestBed.inject(TranslationService).language()).toBe(Language.Russian);
    expect(TestBed.inject(TransferState).get(languageKey, Language.English)).toBe(Language.Russian);
    expect(readCookie).not.toHaveBeenCalled();
    expect(readLanguages).not.toHaveBeenCalled();
  });

  it.each([
    { header: 'en;q=0.8, RU-ru ; Q=0.9', expected: Language.Russian },
    { header: 'fr,ru;q=0.9', expected: Language.English },
    { header: 'en;q=0.8,ru;q=0.8', expected: Language.English },
    { header: 'ru;q=0.8,en;q=0.8', expected: Language.Russian },
    { header: 'ru;q=0', expected: Language.English },
    { header: '*;q=0,ru', expected: Language.Russian },
    { header: '', expected: Language.English },
  ])('выбирает $expected из Accept-Language «$header»', ({ header, expected }) => {
    configureServer({ 'accept-language': header });
    expect(TestBed.inject(TranslationService).language()).toBe(expected);
  });

  it.each(['ru;q=2', 'ru;q=abc', 'ru;', 'ru;q=1;extra=1', 'ru-!!!'])(
    'пропускает некорректное предпочтение «%s»',
    (invalid) => {
      configureServer({ 'accept-language': `${invalid},en;q=0.1` });
      expect(TestBed.inject(TranslationService).language()).toBe(Language.English);
    },
  );

  it('на сервере игнорирует некорректную cookie и использует заголовок', () => {
    configureServer({ cookie: 'currentLanguage=en=extra', 'accept-language': 'ru-RU' });
    expect(TestBed.inject(TranslationService).language()).toBe(Language.Russian);
  });

  it('без серверного запроса выбирает английский независимо от браузерного окружения', () => {
    configureServer();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([Language.Russian]);
    document.cookie = `currentLanguage=${Language.Russian}; Path=/`;
    expect(TestBed.inject(TranslationService).language()).toBe(Language.English);
  });

  it('изолирует язык и TransferState разных серверных запросов', () => {
    configureServer({ 'accept-language': Language.Russian });
    const first = TestBed.inject(TranslationService);
    const firstState = TestBed.inject(TransferState);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    configureServer({ 'accept-language': Language.English });
    const second = TestBed.inject(TranslationService);
    const secondState = TestBed.inject(TransferState);
    expect(first.language()).toBe(Language.Russian);
    expect(second.language()).toBe(Language.English);
    expect(secondState).not.toBe(firstState);
    expect(firstState.get(languageKey, Language.English)).toBe(Language.Russian);
    expect(secondState.get(languageKey, Language.Russian)).toBe(Language.English);
  });

  it('обновляет словарь и lang при смене языка в обе стороны', () => {
    const service = TestBed.inject(TranslationService);
    for (const language of [Language.Russian, Language.English]) {
      service.setLanguage(language);
      TestBed.tick();
      expect(service.language()).toBe(language);
      expect(service.translations()).toEqual(language === Language.Russian ? ru : en);
      expect(document.documentElement.lang).toBe(language);
    }
  });

  it('сохраняет ручной выбор после пересоздания сервиса и не изменяет cookie темы', () => {
    document.cookie = `currentTheme=${ThemeMode.System}; Path=/`;
    TestBed.inject(TranslationService).setLanguage(Language.Russian);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(TranslationService).language()).toBe(Language.Russian);
    expect(document.cookie).toContain(`currentTheme=${ThemeMode.System}`);
  });

  it.each(['http:', 'https:'])(
    'записывает срок 400 дней, путь и SameSite с корректным Secure для %s',
    (protocol) => {
      const pageDocument = {
        cookie: '',
        location: { protocol },
        defaultView: window,
        documentElement: document.documentElement,
        getElementById: document.getElementById.bind(document),
      };
      TestBed.overrideProvider(DOCUMENT, { useValue: pageDocument });
      TestBed.inject(TranslationService).setLanguage(Language.Russian);
      const secure = protocol === 'https:' ? '; Secure' : '';
      expect(pageDocument.cookie).toBe(
        `currentLanguage=${Language.Russian}; Path=/; Max-Age=34560000; SameSite=Lax${secure}`,
      );
    },
  );

  it('на сервере меняет язык документа без записи браузерной cookie', () => {
    configureServer({});
    const writeCookie = vi.spyOn(document, 'cookie', 'set');
    TestBed.inject(TranslationService).setLanguage(Language.Russian);
    TestBed.tick();
    expect(document.documentElement.lang).toBe(Language.Russian);
    expect(writeCookie).not.toHaveBeenCalled();
  });

  it('содержит одинаковые непустые строковые переводы по всем путям обоих словарей', () => {
    function collectPaths(value: unknown, prefix = ''): string[] {
      if (typeof value === 'string') {
        expect(value.trim(), prefix).not.toBe('');
        return [prefix];
      }
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Недопустимый перевод по пути ${prefix}`);
      }
      const entries = Object.entries(value);
      expect(entries.length, prefix).toBeGreaterThan(0);
      return entries
        .flatMap(([key, nested]) => collectPaths(nested, prefix ? `${prefix}.${key}` : key))
        .sort();
    }
    expect(collectPaths(ru)).toEqual(collectPaths(en));
  });
});
