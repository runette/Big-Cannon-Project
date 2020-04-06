import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpRecordSurveyorComponent } from './bcp-record-surveyor.component';

describe('BcpRecordSurveyorComponent', () => {
  let component: BcpRecordSurveyorComponent;
  let fixture: ComponentFixture<BcpRecordSurveyorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpRecordSurveyorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpRecordSurveyorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});