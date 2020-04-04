import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpHomeComponent } from './bcp-home.component';

describe('BcpHomeComponent', () => {
  let component: BcpHomeComponent;
  let fixture: ComponentFixture<BcpHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
