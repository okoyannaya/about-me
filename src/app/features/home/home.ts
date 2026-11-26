import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';

import { CharacterCylinder } from '@components/character-cylinder/character-cylinder';

import { AnalyticsService } from '@services/analytics.service';

@Component({
  selector: 'app-home',
  imports: [CharacterCylinder],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly _analyticsService = inject(AnalyticsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  public constructor() {
    afterNextRender(() => {
      const view = this._elementRef.nativeElement.ownerDocument.defaultView;
      if (!view || !('IntersectionObserver' in view)) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            this._analyticsService.trackEvent(`section_${entry.target.id}_view`);
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -50% 0px' },
      );

      this._elementRef.nativeElement
        .querySelectorAll('[data-navigation-section]')
        .forEach((section) => observer.observe(section));

      this._destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
