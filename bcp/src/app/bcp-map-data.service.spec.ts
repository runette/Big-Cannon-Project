import { TestBed } from '@angular/core/testing';

import { BcpMapDataService } from './bcp-map-data.service';

describe('BcpMapDataService', () => {
  let service: BcpMapDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpMapDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
