import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ICONS } from '@icons/index';

import { Icon } from '@components/icon/icon';

import { ThemeMode, ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);

  protected readonly options: {
    value: ThemeMode;
    label: string;
    icon: ICONS;
    lightIcon?: ICONS;
    darkIcon?: ICONS;
  }[] = [
    { value: ThemeMode.Light, label: 'Светлая тема', icon: ICONS.SUN },
    { value: ThemeMode.Dark, label: 'Тёмная тема', icon: ICONS.MOON },
    {
      value: ThemeMode.System,
      label: 'Системная тема',
      icon: ICONS.SYSTEM,
      lightIcon: ICONS.SYSTEM_LIGHT,
      darkIcon: ICONS.SYSTEM_DARK,
    },
  ];
}
