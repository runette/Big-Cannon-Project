import { TestBed } from '@angular/core/testing';

import { BcpSiteDataService } from './bcp-site-data.service';

describe('BcpSiteDataService', () => {
  let service: BcpSiteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpSiteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
