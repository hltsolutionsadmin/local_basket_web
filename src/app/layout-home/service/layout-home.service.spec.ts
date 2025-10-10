import { TestBed } from '@angular/core/testing';

import { LayoutHomeService } from './layout-home.service';

describe('LayoutHomeService', () => {
  let service: LayoutHomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutHomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
