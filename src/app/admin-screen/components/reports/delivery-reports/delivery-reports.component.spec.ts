import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReportsComponent } from './delivery-reports.component';

describe('DeliveryReportsComponent', () => {
  let component: DeliveryReportsComponent;
  let fixture: ComponentFixture<DeliveryReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
