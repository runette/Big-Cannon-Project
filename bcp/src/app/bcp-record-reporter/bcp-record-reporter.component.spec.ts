import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpRecordReporterComponent } from './bcp-record-reporter.component';

describe('BcpRecordReporterComponent', () => {
  let component: BcpRecordReporterComponent;
  let fixture: ComponentFixture<BcpRecordReporterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpRecordReporterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpRecordReporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
