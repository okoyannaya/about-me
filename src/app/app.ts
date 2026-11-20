import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Layout } from '@layout/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Layout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {}
