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
import { Router, RouterLink } from '@angular/router';

import { LanguageToggle } from '@components/language-toggle/language-toggle';
import { ThemeToggle } from '@components/theme-toggle/theme-toggle';

import { TranslationService } from '@services/translation.service';

interface NavigationOption {
  path: string;
  label: string;
  fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle, LanguageToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _router = inject(Router);
  private readonly _translationService = inject(TranslationService);

  private readonly _activeSection = signal('about');

  protected readonly options = computed<NavigationOption[]>(() => {
    const t = this._translationService.translations().navigation;

    return [
      { path: '/', fragment: 'about', label: t.about },
      { path: '/', fragment: 'technologies', label: t.technologies },
      { path: '/', fragment: 'work', label: t.work },
      { path: '/portfolio', label: t.portfolio },
      { path: '/', fragment: 'contact', label: t.contact },
    ];
  });

  public constructor() {
    afterNextRender(() => {
      this._observeSections();
    });
  }

  protected isActive(option: NavigationOption): boolean {
    const isCurrentPage = this._router.isActive(option.path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });

    if (option.fragment) {
      return isCurrentPage && this._activeSection() === option.fragment;
    }

    return isCurrentPage;
  }

  protected scrollToSection(event: MouseEvent, fragment: string): void {
    event.preventDefault();

    this._document.getElementById(fragment)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private _observeSections(): void {
    const sections = this._document.querySelectorAll<HTMLElement>('[data-navigation-section]');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this._activeSection.set(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-30% 0px -60%',
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    this._destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }
}
