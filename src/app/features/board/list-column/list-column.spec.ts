import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListColumn } from './list-column';

describe('ListColumn', () => {
  let component: ListColumn;
  let fixture: ComponentFixture<ListColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListColumn],
    }).compileComponents();

    fixture = TestBed.createComponent(ListColumn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
