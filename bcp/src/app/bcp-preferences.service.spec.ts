import { TestBed } from '@angular/core/testing';

import { BcpPreferencesService } from './bcp-preferences.service';

describe('BcpPreferencesService', () => {
  let service: BcpPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcpPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
