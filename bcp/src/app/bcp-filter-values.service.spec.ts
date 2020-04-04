import { TestBed } from '@angular/core/testing';

import { BcpFilterValuesService } from './bcp-filter-values.service';

describe('BcpFilterValuesService', () => {
  let service: BcpFilterValuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpFilterValuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
