import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { createIconUrl } from '@icons/index';
import type { IconName } from '@icons/index';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  readonly icon = input.required<IconName>();
  readonly lightIcon = input<IconName>();
  readonly darkIcon = input<IconName>();
  readonly label = input.required<string>();
  readonly size = input(24);
  readonly color = input<string>();
  readonly isPressed = input<boolean>();
  readonly clicked = output<void>();

  protected readonly iconMask = computed(() => createIconUrl(this.icon()));
  protected readonly lightIconMask = computed(() => {
    const icon = this.lightIcon();
    return icon ? createIconUrl(icon) : undefined;
  });
  protected readonly darkIconMask = computed(() => {
    const icon = this.darkIcon();
    return icon ? createIconUrl(icon) : undefined;
  });
}
