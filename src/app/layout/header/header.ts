import { Location, UpperCasePipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isActive, type IsActiveMatchOptions, Router, RouterLink } from '@angular/router';

import { debounceTime, fromEvent } from 'rxjs';

import { LanguageToggle } from '@components/language-toggle/language-toggle';
import { ThemeToggle } from '@components/theme-toggle/theme-toggle';

import { TranslationService } from '@services/translation.service';

const DEFAULT_SECTION = 'about';
const PAGE_MATCH_OPTIONS: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle, LanguageToggle, UpperCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _location = inject(Location);
  private readonly _router = inject(Router);
  private readonly _translationService = inject(TranslationService);

  private readonly _navigation = this._router.lastSuccessfulNavigation;
  private readonly _isHome = isActive('/', this._router, PAGE_MATCH_OPTIONS);
  private readonly _isPortfolio = isActive('/portfolio', this._router, PAGE_MATCH_OPTIONS);
  private readonly _scrolledSection = signal<{ navigationId: number; fragment: string } | null>(
    null,
  );

  private readonly _activeSection = computed(() => {
    const navigation = this._navigation();

    if (!navigation || !this._isHome()) return null;

    const scrolledSection = this._scrolledSection();
    return scrolledSection?.navigationId === navigation.id
      ? scrolledSection.fragment
      : (navigation.finalUrl?.fragment ?? DEFAULT_SECTION);
  });

  protected readonly options = computed(() => {
    const t = this._translationService.translations().navigation;
    const activeSection = this._activeSection();

    return [
      { path: '/', fragment: DEFAULT_SECTION, label: t.about },
      { path: '/', fragment: 'technologies', label: t.technologies },
      { path: '/', fragment: 'work', label: t.work },
      { path: '/', fragment: 'contact', label: t.contact },
      { path: '/portfolio', label: t.portfolio },
    ].map((option) => ({
      ...option,
      isActive: option.fragment ? option.fragment === activeSection : this._isPortfolio(),
    }));
  });

  public constructor() {
    afterNextRender(() => {
      // Let anchor scrolling settle before updating the URL from the viewport.
      fromEvent(this._document, 'scroll')
        .pipe(debounceTime(100), takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this._syncSectionFromScroll());
    });
  }

  private _syncSectionFromScroll(): void {
    const navigation = this._navigation();
    if (!navigation || !this._isHome() || this._router.currentNavigation()) return;

    const sections = this._document.querySelectorAll<HTMLElement>('[data-navigation-section]');
    const activationLine = this._document.documentElement.clientHeight * 0.3;
    let visibleSection = sections.item(0);

    for (const section of sections) {
      if (section.getBoundingClientRect().top > activationLine) break;
      visibleSection = section;
    }

    const fragment = visibleSection?.id;
    if (!fragment || fragment === this._activeSection()) return;

    this._scrolledSection.set({ navigationId: navigation.id, fragment });
    const url = this._router.parseUrl(this._location.path(true));
    url.fragment = fragment;
    this._location.replaceState(this._router.serializeUrl(url), '', this._location.getState());
  }
}
