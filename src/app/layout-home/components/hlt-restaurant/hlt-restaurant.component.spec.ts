import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HltRestaurantComponent } from './hlt-restaurant.component';

describe('HltRestaurantComponent', () => {
  let component: HltRestaurantComponent;
  let fixture: ComponentFixture<HltRestaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HltRestaurantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HltRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
