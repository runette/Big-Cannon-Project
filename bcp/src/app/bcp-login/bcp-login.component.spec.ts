import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpLoginComponent } from './bcp-login.component';

describe('BcpLoginComponent', () => {
  let component: BcpLoginComponent;
  let fixture: ComponentFixture<BcpLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
