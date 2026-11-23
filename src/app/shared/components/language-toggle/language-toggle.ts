import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslationService } from '@services/translation.service';

import { Language } from '@translations/language.types';

@Component({
  selector: 'app-language-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './language-toggle.html',
  styleUrl: './language-toggle.scss',
  host: {
    '[attr.data-language]': 'translationService.language()',
  },
})
export class LanguageToggle {
  protected readonly translationService = inject(TranslationService);
  protected readonly options = Object.values(Language);
}
