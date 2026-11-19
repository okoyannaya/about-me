import { TestBed } from '@angular/core/testing';

import { ThemeMode, ThemeService } from '@services/theme.service';

import { IconName } from '@icons/index';

import { ThemeToggle } from './theme-toggle';
describe('ThemeToggle', () => {
  beforeEach(() => {
    document.cookie = 'currentTheme=; Path=/; Max-Age=0';
    TestBed.configureTestingModule({ imports: [ThemeToggle] });
  });

  afterEach(() => {
    document.cookie = 'currentTheme=; Path=/; Max-Age=0';
    document.documentElement.removeAttribute('data-theme');
  });

  it('показывает иконки светлой, тёмной и системной тем', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    const icons = [...buttons].map((button) =>
      (button.querySelector('.icon') as HTMLElement).style.getPropertyValue('--icon-mask'),
    );

    expect(icons).toEqual(
      [IconName.Sun, IconName.Moon, IconName.System].map((icon) => `url("icons/${icon}.svg")`),
    );
    const systemIcon = buttons[2].querySelector('.icon') as HTMLElement;
    expect(systemIcon.style.getPropertyValue('--light-icon-mask')).toContain(
      'icons/system-light.svg',
    );
    expect(systemIcon.style.getPropertyValue('--dark-icon-mask')).toContain(
      'icons/system-dark.svg',
    );
    expect([...buttons].map((button) => button.getAttribute('aria-label'))).toEqual([
      'Светлая тема',
      'Тёмная тема',
      'Системная тема',
    ]);
    expect([...buttons].map((button) => button.getAttribute('title'))).toEqual([
      'Светлая тема',
      'Тёмная тема',
      'Системная тема',
    ]);
    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('переключает тему через клик по иконке', async () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    await fixture.whenStable();

    expect(TestBed.inject(ThemeService).themeMode()).toBe(ThemeMode.Dark);
    expect(document.cookie).toContain(`currentTheme=${ThemeMode.Dark}`);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.querySelector('.theme-switcher').getAttribute('data-mode')).toBe(
      ThemeMode.Dark,
    );
  });
});
