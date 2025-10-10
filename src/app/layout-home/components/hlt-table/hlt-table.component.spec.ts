import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HltTableComponent } from './hlt-table.component';

describe('HltTableComponent', () => {
  let component: HltTableComponent;
  let fixture: ComponentFixture<HltTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HltTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HltTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
