import { TestBed } from '@angular/core/testing';

import { DMLCustomersService } from './dmlcustomers.service';

describe('DMLCustomersService', () => {
  let service: DMLCustomersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DMLCustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
