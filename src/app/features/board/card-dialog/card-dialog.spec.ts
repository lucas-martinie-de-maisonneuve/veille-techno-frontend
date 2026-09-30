import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDialog } from './card-dialog';

describe('CardDialog', () => {
  let component: CardDialog;
  let fixture: ComponentFixture<CardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
