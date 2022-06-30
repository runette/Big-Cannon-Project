import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpSiteSelectorComponent } from './bcp-site-selector.component';

describe('BcpSiteSelectorComponent', () => {
  let component: BcpSiteSelectorComponent;
  let fixture: ComponentFixture<BcpSiteSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpSiteSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpSiteSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
