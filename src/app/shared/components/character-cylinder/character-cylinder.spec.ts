import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { CharacterCylinder } from './character-cylinder';

describe('CharacterCylinder', () => {
  let fixture: ComponentFixture<CharacterCylinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCylinder],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCylinder);
    fixture.detectChanges();
  });

  it('размещает каждый символ на отдельной 3D-позиции', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.character-cylinder__character').length).toBeGreaterThan(30);
  });
});
