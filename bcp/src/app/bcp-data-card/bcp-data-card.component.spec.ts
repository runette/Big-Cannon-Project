import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpDataCardComponent } from './bcp-data-card.component';

describe('BcpDataCardComponent', () => {
  let component: BcpDataCardComponent;
  let fixture: ComponentFixture<BcpDataCardComponent>;

  beforeEach(async(() => {
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
