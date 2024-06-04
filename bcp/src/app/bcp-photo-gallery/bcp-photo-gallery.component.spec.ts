import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpPhotoGalleryComponent } from './bcp-photo-gallery.component';

describe('BcpPhotoGalleryComponent', () => {
  let component: BcpPhotoGalleryComponent;
  let fixture: ComponentFixture<BcpPhotoGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcpPhotoGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BcpPhotoGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
