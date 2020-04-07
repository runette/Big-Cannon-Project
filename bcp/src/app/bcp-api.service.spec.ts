import { TestBed } from '@angular/core/testing';

import { BcpApiService } from './bcp-api.service';

describe('BcpApiService', () => {
  let service: BcpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
