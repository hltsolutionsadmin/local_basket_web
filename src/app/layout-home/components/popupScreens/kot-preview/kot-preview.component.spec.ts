import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotPreviewComponent } from './kot-preview.component';

describe('KotPreviewComponent', () => {
  let component: KotPreviewComponent;
  let fixture: ComponentFixture<KotPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KotPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KotPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
