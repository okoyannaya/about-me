import { Location, NgTemplateOutlet, UpperCasePipe, ViewportScroller } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isActive, type IsActiveMatchOptions, Router, RouterLink } from '@angular/router';

import { debounceTime, fromEvent, tap } from 'rxjs';

import { LanguageToggle } from '@components/language-toggle/language-toggle';
import { ThemeToggle } from '@components/theme-toggle/theme-toggle';

import { AnalyticsService } from '@services/analytics.service';
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
  imports: [RouterLink, ThemeToggle, LanguageToggle, NgTemplateOutlet, UpperCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-open]': 'isControlsOpen()',
  },
})
export class Header {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _location = inject(Location);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _router = inject(Router);
  private readonly _analyticsService = inject(AnalyticsService);
  private readonly _translationService = inject(TranslationService);

  private readonly _navigation = this._router.lastSuccessfulNavigation;
  private readonly _isHome = isActive('/', this._router, PAGE_MATCH_OPTIONS);
  private readonly _isPortfolio = isActive('/portfolio', this._router, PAGE_MATCH_OPTIONS);
  private _headerHeight = 80;
  protected readonly isControlsOpen = signal(false);
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
      { path: '/', fragment: DEFAULT_SECTION, label: t.about, key: 'about' },
      { path: '/', fragment: 'technologies', label: t.technologies, key: 'technologies' },
      { path: '/', fragment: 'work', label: t.work, key: 'work' },
      { path: '/', fragment: 'contact', label: t.contact, key: 'contact' },
      { path: '/portfolio', label: t.portfolio, key: 'portfolio' },
    ].map((option) => ({
      ...option,
      isActive: option.fragment ? option.fragment === activeSection : this._isPortfolio(),
    }));
  });
  protected readonly controlsLabel = computed(
    () => this._translationService.translations().navigation.controls,
  );

  public constructor() {
    this._viewportScroller.setOffset(() => [0, this._headerHeight]);

    afterNextRender(() => {
      const observer = new ResizeObserver(() => {
        if (!this.isControlsOpen()) {
          const height = this._element.nativeElement.getBoundingClientRect().height;
          this._headerHeight = height;
          this._document.documentElement.style.setProperty('--header-height', `${height}px`);
        }
      });
      observer.observe(this._element.nativeElement);
      this._destroyRef.onDestroy(() => {
        observer.disconnect();
        this._document.documentElement.style.removeProperty('--header-height');
      });

      // Let anchor scrolling settle before updating the URL from the viewport.
      fromEvent(this._document, 'scroll')
        .pipe(
          tap(() => this.isControlsOpen.set(false)),
          debounceTime(100),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe(() => this._syncSectionFromScroll());
    });
  }

  protected trackNavigationClick(key: string): void {
    this._analyticsService.trackEvent(`navigation_${key}_click`);
  }

  protected toggleControls(): void {
    this.isControlsOpen.update((isOpen) => !isOpen);
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
