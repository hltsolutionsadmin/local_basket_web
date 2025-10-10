import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableRetaurantComponent } from './disable-retaurant.component';

describe('DisableRetaurantComponent', () => {
  let component: DisableRetaurantComponent;
  let fixture: ComponentFixture<DisableRetaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisableRetaurantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisableRetaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
