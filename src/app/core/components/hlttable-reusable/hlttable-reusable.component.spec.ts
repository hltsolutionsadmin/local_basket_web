import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlttableReusableComponent } from './hlttable-reusable.component';

describe('HlttableReusableComponent', () => {
  let component: HlttableReusableComponent;
  let fixture: ComponentFixture<HlttableReusableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HlttableReusableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HlttableReusableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
