import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpHomeComponent } from './bcp-home.component';

describe('BcpHomeComponent', () => {
  let component: BcpHomeComponent;
  let fixture: ComponentFixture<BcpHomeComponent>;

  beforeEach(waitForAsync(() => {
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
