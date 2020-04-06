import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpHelpComponent } from './bcp-help.component';

describe('BcpHelpComponent', () => {
  let component: BcpHelpComponent;
  let fixture: ComponentFixture<BcpHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
