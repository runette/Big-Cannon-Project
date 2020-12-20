import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpGmapComponent } from './bcp-gmap.component';

describe('BcpGmapCompoentComponent', () => {
  let component: BcpGmapComponent;
  let fixture: ComponentFixture<BcpGmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpGmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpGmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
