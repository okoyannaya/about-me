import { makeStateKey, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThemeMode, ThemeService } from './theme.service';
import { ThemeToggle } from '../components/theme-toggle/theme-toggle';

describe('ThemeService', () => {
  const themeModes = Object.values(ThemeMode);

  beforeEach(() => {
    document.cookie = 'currentTheme=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ imports: [ThemeToggle] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    document.cookie = 'currentTheme=; Path=/; Max-Age=0';
    document.documentElement.removeAttribute('data-theme');
  });

  it.each(themeModes)(
    'сохраняет тему %s из cookie и активную кнопку с первого рендера и после повторной загрузки',
    async (theme) => {
      document.cookie = `currentTheme=${theme}; Path=/`;
      const setAttribute = vi.spyOn(document.documentElement, 'setAttribute');

      for (let load = 0; load < 2; load++) {
        const fixture = TestBed.createComponent(ThemeToggle);
        fixture.detectChanges();

        const service = TestBed.inject(ThemeService);
        expect(service.themeMode()).toBe(theme);
        const buttons = fixture.nativeElement.querySelectorAll('button');
        const selectedIndex = themeModes.indexOf(theme);
        expect(buttons[selectedIndex].getAttribute('aria-pressed')).toBe('true');
        expect(fixture.nativeElement.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(
          1,
        );
        expect(
          fixture.nativeElement.querySelector('.theme-switcher').getAttribute('data-mode'),
        ).toBe(theme);

        await fixture.whenStable();
        expect(service.themeMode()).toBe(theme);
        expect(document.cookie).toContain(`currentTheme=${theme}`);

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [ThemeToggle] });
      }

      const appliedThemes = setAttribute.mock.calls
        .filter(([name]) => name === 'data-theme')
        .map(([, value]) => value);
      expect(appliedThemes.length).toBeGreaterThan(0);
      expect(appliedThemes.every((value) => value === theme)).toBe(true);
    },
  );

  it.each(themeModes)(
    'читает тему %s из SSR-запроса и передаёт начальное состояние браузеру',
    (theme) => {
      document.cookie = `currentTheme=${ThemeMode.Light}; Path=/`;
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
      TestBed.overrideProvider(REQUEST, {
        useValue: new Request('http://localhost/', {
          headers: { cookie: `other=value; currentTheme=${theme}; another=value` },
        }),
      });

      const service = TestBed.inject(ThemeService);
      expect(service.themeMode()).toBe(theme);
      expect(
        TestBed.inject(TransferState).get(makeStateKey<ThemeMode>('theme-mode'), ThemeMode.System),
      ).toBe(theme);
    },
  );

  it('использует серверное состояние при гидрации, даже если cookie в браузере изменилась', () => {
    document.cookie = `currentTheme=${ThemeMode.Light}; Path=/`;
    const transferState = TestBed.inject(TransferState);
    const key = makeStateKey<ThemeMode>('theme-mode');
    transferState.set(key, ThemeMode.Dark);

    expect(TestBed.inject(ThemeService).themeMode()).toBe(ThemeMode.Dark);
    expect(transferState.hasKey(key)).toBe(false);
  });

  it.each([null, 'invalid', 'dark-extra'])(
    'выбирает системный режим, если cookie отсутствует или содержит недопустимое значение: %s',
    (saved) => {
      if (saved !== null) document.cookie = `currentTheme=${saved}; Path=/`;
      expect(TestBed.inject(ThemeService).themeMode()).toBe(ThemeMode.System);
    },
  );

  it('сохраняет выбранный режим в cookie и обновляет тему страницы', async () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    await fixture.whenStable();
    const service = TestBed.inject(ThemeService);

    for (const mode of themeModes) {
      service.setTheme(mode);
      TestBed.tick();
      expect(document.cookie).toContain(`currentTheme=${mode}`);
      expect(document.documentElement.getAttribute('data-theme')).toBe(mode);
    }
  });
});
