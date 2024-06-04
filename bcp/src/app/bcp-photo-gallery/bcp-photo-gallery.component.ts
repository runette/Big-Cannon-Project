import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { Gallery, GalleryRef, GalleryItem } from 'ng-gallery';

@Component({
  selector: 'app-bcp-photo-gallery',
  standalone: false,
  templateUrl: './bcp-photo-gallery.component.html',
  styleUrl: './bcp-photo-gallery.component.scss'
})
export class BcpPhotoGalleryComponent implements OnInit{

  private _images: GalleryItem[];
  @Output() error: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  set images(images: GalleryItem[]){
    this._images = images;
    this.error.next(null)
    this.updateImages();
  }

  get images():GalleryItem[]{
    return this._images;
  }

  galleryRef: GalleryRef;

  constructor( private gallery: Gallery) {

  }

  ngOnInit(): void {
    this.galleryRef = this.gallery.ref('photos');
    this.updateImages();
  }

  updateImages(){
    if (this.galleryRef) {
      this.galleryRef.reset();
      this.galleryRef.load(this.images)
    }
  }

}
