import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CharacterCylinder } from '@components/character-cylinder/character-cylinder';

@Component({
  selector: 'app-home',
  imports: [CharacterCylinder],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
