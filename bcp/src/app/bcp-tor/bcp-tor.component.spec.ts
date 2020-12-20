import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpTorComponent } from './bcp-tor.component';

describe('BcpTorComponent', () => {
  let component: BcpTorComponent;
  let fixture: ComponentFixture<BcpTorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpTorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpTorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
