import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpPhotosComponent } from './bcp-photos.component';

describe('BcpPhotosComponent', () => {
  let component: BcpPhotosComponent;
  let fixture: ComponentFixture<BcpPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpPhotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
