import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterSelectionComponent } from './printer-selection.component';

describe('PrinterSelectionComponent', () => {
  let component: PrinterSelectionComponent;
  let fixture: ComponentFixture<PrinterSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrinterSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
