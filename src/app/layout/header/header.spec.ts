import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'portfolio', children: [] },
          { path: '**', children: [] },
        ]),
      ],
    }).compileComponents();
  });

  it('выделяет ссылку «Портфолио» после первого клика', async () => {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/#about');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLAnchorElement>('nav a[href="/portfolio"]')?.click();
    await fixture.whenStable();

    expect(compiled.querySelector('nav a.active')?.getAttribute('href')).toBe('/portfolio');
  });

  it.each(['/portfolio', '/navigation-test-404'])(
    'выделяет ссылку на секцию после возвращения с %s',
    async (path) => {
      const fixture = TestBed.createComponent(Header);
      await fixture.whenStable();
      await TestBed.inject(Router).navigateByUrl(path);
      await fixture.whenStable();
      const compiled = fixture.nativeElement as HTMLElement;

      compiled.querySelector<HTMLAnchorElement>('nav a[href="/#work"]')?.click();
      await fixture.whenStable();

      expect(compiled.querySelector('nav a.active')?.getAttribute('href')).toBe('/#work');
    },
  );
});
