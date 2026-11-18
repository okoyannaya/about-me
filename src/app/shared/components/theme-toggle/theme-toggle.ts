import { Component, inject } from '@angular/core';
import { ThemeMode, ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);

  protected readonly options: { value: ThemeMode; label: string }[] = [
    { value: ThemeMode.Light, label: '☀️ Светлая' },
    { value: ThemeMode.Dark, label: '🌙 Темная' },
    { value: ThemeMode.System, label: '💻 Системная' },
  ];
}
