import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemAvailabilityComponent } from './item-availability.component';

describe('ItemAvailabilityComponent', () => {
  let component: ItemAvailabilityComponent;
  let fixture: ComponentFixture<ItemAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
