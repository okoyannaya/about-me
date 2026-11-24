import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-character-cylinder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-cylinder.html',
  styleUrl: './character-cylinder.scss',
})
export class CharacterCylinder {
  protected readonly characters = Array.from('TEXT AROUND THE CYLINDER • CSS 3D • ANGULAR • ');
}
