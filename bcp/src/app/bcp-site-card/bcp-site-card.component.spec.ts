import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpSiteCardComponent } from './bcp-site-card.component';

describe('BcpSiteCardComponent', () => {
  let component: BcpSiteCardComponent;
  let fixture: ComponentFixture<BcpSiteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpSiteCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpSiteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
