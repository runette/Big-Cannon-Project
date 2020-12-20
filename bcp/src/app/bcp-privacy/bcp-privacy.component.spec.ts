import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpPrivacyComponent } from './bcp-privacy.component';

describe('BcpPrivacyComponent', () => {
  let component: BcpPrivacyComponent;
  let fixture: ComponentFixture<BcpPrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpPrivacyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
