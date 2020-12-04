import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpRecordDetailComponent } from './bcp-record-detail.component';

describe('BcpRecordDetailComponent', () => {
  let component: BcpRecordDetailComponent;
  let fixture: ComponentFixture<BcpRecordDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpRecordDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpRecordDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
