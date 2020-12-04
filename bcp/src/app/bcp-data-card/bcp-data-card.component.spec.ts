import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpDataCardComponent } from './bcp-data-card.component';

describe('BcpDataCardComponent', () => {
  let component: BcpDataCardComponent;
  let fixture: ComponentFixture<BcpDataCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpDataCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
