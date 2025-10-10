import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegenarateKotComponent } from './regenarate-kot.component';

describe('RegenarateKotComponent', () => {
  let component: RegenarateKotComponent;
  let fixture: ComponentFixture<RegenarateKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegenarateKotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegenarateKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
