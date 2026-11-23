import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Icon } from '@components/icon/icon';

import { ThemeMode, ThemeService } from '@services/theme.service';

import { IconName } from '@icons/index';

@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  host: {
    role: 'group',
    'aria-label': 'Выбор темы оформления',
    '[attr.data-mode]': 'themeService.themeMode()',
  },
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);

  protected readonly options: {
    value: ThemeMode;
    label: string;
    icon: IconName;
    lightIcon?: IconName;
    darkIcon?: IconName;
  }[] = [
    { value: ThemeMode.Light, label: 'Светлая тема', icon: IconName.Sun },
    { value: ThemeMode.Dark, label: 'Тёмная тема', icon: IconName.Moon },
    {
      value: ThemeMode.System,
      label: 'Системная тема',
      icon: IconName.System,
      lightIcon: IconName.SystemLight,
      darkIcon: IconName.SystemDark,
    },
  ];
}
