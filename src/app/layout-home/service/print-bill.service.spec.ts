import { TestBed } from '@angular/core/testing';

import { PrintBillService } from './print-bill.service';

describe('PrintBillService', () => {
  let service: PrintBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
