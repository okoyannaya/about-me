import { Component, computed, inject, makeStateKey, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TranslationService } from '@services/translation.service';

import en from '@translations/en.json';
import { Language } from '@translations/language.types';
import ru from '@translations/ru.json';

import { LanguageToggle } from './language-toggle';

@Component({
  selector: 'app-language-test-host',
  imports: [LanguageToggle],
  template: `
    <form (submit)="submitted = true">
      <app-language-toggle />
    </form>
    <p data-direct>{{ translationService.translations().navigation.contact }}</p>
    @for (option of options(); track option.id) {
      <a href="#about" data-navigation>{{ option.label }}</a>
    }
  `,
})
class LanguageTestHost {
  protected readonly translationService = inject(TranslationService);
  protected readonly options = computed(() => [
    { id: 'about', label: this.translationService.translations().navigation.about },
  ]);
  submitted = false;
}

function getHost(element: unknown): HTMLElement {
  if (!(element instanceof HTMLElement)) throw new Error('Не найден хост компонента');
  return element;
}

function getButton(host: HTMLElement, language: Language): HTMLButtonElement {
  const button = [...host.querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === language.toUpperCase(),
  );
  if (!button) throw new Error(`Не найдена кнопка ${language}`);
  return button;
}

function expectSelection(host: HTMLElement, language: Language): void {
  expect(host.getAttribute('data-language')).toBe(language);
  expect(host.querySelectorAll('button')).toHaveLength(2);
  expect(host.querySelectorAll('button.active')).toHaveLength(1);
  expect(host.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1);
  for (const option of Object.values(Language)) {
    const button = getButton(host, option);
    expect(button.type).toBe('button');
    expect(button.disabled).toBe(false);
    expect(button.tabIndex).toBe(0);
    expect(button.classList.contains('active')).toBe(option === language);
    expect(button.getAttribute('aria-pressed')).toBe(String(option === language));
  }
}

describe('LanguageToggle', () => {
  let originalLang: string | null;

  beforeEach(() => {
    originalLang = document.documentElement.getAttribute('lang');
    document.cookie = 'currentLanguage=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ imports: [LanguageToggle, LanguageTestHost] });
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([Language.English]);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    document.cookie = 'currentLanguage=; Path=/; Max-Age=0';
    if (originalLang === null) document.documentElement.removeAttribute('lang');
    else document.documentElement.setAttribute('lang', originalLang);
  });

  it.each(Object.values(Language))(
    'отображает постоянные подписи RU и EN и сохранённый выбор %s с первого рендера',
    (language) => {
      document.cookie = `currentLanguage=${language}; Path=/`;
      const fixture = TestBed.createComponent(LanguageToggle);
      fixture.detectChanges();
      const host = getHost(fixture.nativeElement);

      expect(
        [...host.querySelectorAll('button')].map((button) => button.textContent?.trim()),
      ).toEqual(['RU', 'EN']);
      expectSelection(host, language);
    },
  );

  it('отображает автоматически выбранный русский без записи cookie', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU']);
    const fixture = TestBed.createComponent(LanguageToggle);
    fixture.detectChanges();

    expectSelection(getHost(fixture.nativeElement), Language.Russian);
    expect(document.cookie).not.toContain('currentLanguage=');
  });

  it.each(Object.values(Language))(
    'отображает серверный выбор %s вместо отличающейся cookie',
    (language) => {
      const other = language === Language.Russian ? Language.English : Language.Russian;
      document.cookie = `currentLanguage=${other}; Path=/`;
      const state = TestBed.inject(TransferState);
      const key = makeStateKey<Language>('language');
      state.set(key, language);
      const fixture = TestBed.createComponent(LanguageToggle);
      fixture.detectChanges();

      expectSelection(getHost(fixture.nativeElement), language);
      expect(state.hasKey(key)).toBe(false);
      expect(document.cookie).toContain(`currentLanguage=${other}`);
    },
  );

  it('переключает язык в обе стороны кликами и синхронизирует cookie, lang и атрибут для анимации', async () => {
    const fixture = TestBed.createComponent(LanguageToggle);
    fixture.detectChanges();
    const host = getHost(fixture.nativeElement);
    const service = TestBed.inject(TranslationService);
    const select = vi.spyOn(service, 'setLanguage');

    for (const language of [Language.Russian, Language.English, Language.Russian]) {
      getButton(host, language).click();
      await fixture.whenStable();
      expect(select).toHaveBeenLastCalledWith(language);
      expect(service.language()).toBe(language);
      expectSelection(host, language);
      expect(document.cookie).toContain(`currentLanguage=${language}`);
      expect(document.documentElement.lang).toBe(language);
    }
    expect(select).toHaveBeenCalledTimes(3);
  });

  it('сохраняет ручной выбор при клике по уже активному автоматически выбранному языку', async () => {
    const fixture = TestBed.createComponent(LanguageToggle);
    fixture.detectChanges();
    const host = getHost(fixture.nativeElement);
    expect(document.cookie).not.toContain('currentLanguage=');

    getButton(host, Language.English).click();
    await fixture.whenStable();

    expectSelection(host, Language.English);
    expect(document.cookie).toContain(`currentLanguage=${Language.English}`);
  });

  it('реагирует на внешнее изменение сервиса, сохраняя кнопки и фокус', async () => {
    const fixture = TestBed.createComponent(LanguageToggle);
    fixture.detectChanges();
    const host = getHost(fixture.nativeElement);
    const russianButton = getButton(host, Language.Russian);
    const englishButton = getButton(host, Language.English);
    englishButton.focus();
    expect(document.activeElement).toBe(englishButton);

    TestBed.inject(TranslationService).setLanguage(Language.Russian);
    await fixture.whenStable();

    expectSelection(host, Language.Russian);
    expect(getButton(host, Language.Russian)).toBe(russianButton);
    expect(getButton(host, Language.English)).toBe(englishButton);
    expect(document.activeElement).toBe(englishButton);
  });

  it('синхронизирует два экземпляра переключателя через общий сервис', async () => {
    const first = TestBed.createComponent(LanguageToggle);
    const second = TestBed.createComponent(LanguageToggle);
    first.detectChanges();
    second.detectChanges();

    getButton(getHost(first.nativeElement), Language.Russian).click();
    await first.whenStable();
    await second.whenStable();

    expectSelection(getHost(first.nativeElement), Language.Russian);
    expectSelection(getHost(second.nativeElement), Language.Russian);
  });

  it('обновляет перевод в шаблоне и подписи объектов без пересоздания ссылки и отправки формы', async () => {
    const fixture = TestBed.createComponent(LanguageTestHost);
    fixture.detectChanges();
    const host = getHost(fixture.nativeElement);
    const navigation = host.querySelector('[data-navigation]');

    for (const language of [Language.Russian, Language.English]) {
      getButton(host, language).click();
      await fixture.whenStable();
      const dictionary = language === Language.Russian ? ru : en;
      expect(host.querySelector('[data-direct]')?.textContent?.trim()).toBe(
        dictionary.navigation.contact,
      );
      expect(host.querySelector('[data-navigation]')).toBe(navigation);
      expect(navigation?.textContent?.trim()).toBe(dictionary.navigation.about);
      expect(fixture.componentInstance.submitted).toBe(false);
    }
  });
});
