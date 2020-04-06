import { TestBed } from '@angular/core/testing';

import { BcpUserService } from './bcp-user.service';

describe('BcpUserService', () => {
  let service: BcpUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
