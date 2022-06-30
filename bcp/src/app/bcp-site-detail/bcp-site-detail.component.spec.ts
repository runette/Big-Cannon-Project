import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpSiteDetailComponent } from './bcp-site-detail.component';

describe('BcpSiteDetailComponent', () => {
  let component: BcpSiteDetailComponent;
  let fixture: ComponentFixture<BcpSiteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpSiteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpSiteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
