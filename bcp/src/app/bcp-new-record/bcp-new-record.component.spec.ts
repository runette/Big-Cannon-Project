import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpNewRecordComponent } from './bcp-new-record.component';

describe('BcpNewRecordComponent', () => {
  let component: BcpNewRecordComponent;
  let fixture: ComponentFixture<BcpNewRecordComponent>;

  beforeEach(async(() => {
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
