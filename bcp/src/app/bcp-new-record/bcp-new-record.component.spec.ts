import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpNewRecordComponent } from './bcp-new-record.component';

describe('BcpNewRecordComponent', () => {
  let component: BcpNewRecordComponent;
  let fixture: ComponentFixture<BcpNewRecordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpNewRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpNewRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
