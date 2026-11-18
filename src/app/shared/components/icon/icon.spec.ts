import { TestBed } from '@angular/core/testing';

import { ICONS } from '@icons/index';

import { Icon } from './icon';

describe('Icon', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Icon] }).compileComponents();
  });

  it.each(Object.values(ICONS))('показывает иконку %s по имени', (icon) => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('icon', icon);
    fixture.componentRef.setInput('label', 'Название иконки');
    fixture.detectChanges();

    const glyph = fixture.nativeElement.querySelector('.icon') as HTMLElement;
    expect(glyph.style.getPropertyValue('--icon-mask')).toContain(`icons/${icon}.svg`);
  });

  it('задаёт варианты иконки для системной светлой и тёмной схемы', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('icon', ICONS.SYSTEM);
    fixture.componentRef.setInput('lightIcon', ICONS.SYSTEM_LIGHT);
    fixture.componentRef.setInput('darkIcon', ICONS.SYSTEM_DARK);
    fixture.componentRef.setInput('label', 'Системная тема');
    fixture.detectChanges();

    const glyph = fixture.nativeElement.querySelector('.icon') as HTMLElement;
    expect(glyph.style.getPropertyValue('--icon-mask')).toContain('icons/system.svg');
    expect(glyph.style.getPropertyValue('--light-icon-mask')).toContain('icons/system-light.svg');
    expect(glyph.style.getPropertyValue('--dark-icon-mask')).toContain('icons/system-dark.svg');
  });

  it('применяет размер, цвет и доступную подпись', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('icon', ICONS.SUN);
    fixture.componentRef.setInput('label', 'Светлая тема');
    fixture.componentRef.setInput('size', 32);
    fixture.componentRef.setInput('color', '#ff0000');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const glyph = button.querySelector('.icon') as HTMLElement;

    expect(button.getAttribute('aria-label')).toBe('Светлая тема');
    expect(button.getAttribute('title')).toBe('Светлая тема');
    expect(button.style.color).toBe('rgb(255, 0, 0)');
    expect(glyph.style.width).toBe('32px');
    expect(glyph.style.height).toBe('32px');
  });

  it('вызывает обработчик родителя при клике', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('icon', ICONS.MOON);
    fixture.componentRef.setInput('label', 'Тёмная тема');
    fixture.detectChanges();

    const handleClick = vi.fn();
    fixture.componentInstance.clicked.subscribe(handleClick);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('отмечает нажатую иконку для вспомогательных технологий', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('icon', ICONS.SYSTEM);
    fixture.componentRef.setInput('label', 'Системная тема');
    fixture.componentRef.setInput('isPressed', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('true');

    fixture.componentRef.setInput('isPressed', false);
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
});
