import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReportsModelComponent } from './delivery-reports-model.component';

describe('DeliveryReportsModelComponent', () => {
  let component: DeliveryReportsModelComponent;
  let fixture: ComponentFixture<DeliveryReportsModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryReportsModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryReportsModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
