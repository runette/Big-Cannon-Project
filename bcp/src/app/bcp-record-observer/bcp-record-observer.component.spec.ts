import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpRecordObserverComponent } from './bcp-record-observer.component';

describe('BcpRecordObserverComponent', () => {
  let component: BcpRecordObserverComponent;
  let fixture: ComponentFixture<BcpRecordObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpRecordObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpRecordObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
