import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpV2Component } from './bcp-v2.component';

describe('BcpV2Component', () => {
  let component: BcpV2Component;
  let fixture: ComponentFixture<BcpV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpV2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
