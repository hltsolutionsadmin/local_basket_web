import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeToggleComponent } from './time-toggle.component';

describe('TimeToggleComponent', () => {
  let component: TimeToggleComponent;
  let fixture: ComponentFixture<TimeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
