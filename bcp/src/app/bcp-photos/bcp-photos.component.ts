import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Gallery, GalleryRef, GalleryItem } from 'ng-gallery';
import { AngularFireStorage  } from '@angular/fire/compat/storage';
import { BcpApiService,  } from '../bcp-api.service';
import { BcpMapDataService } from '../bcp-map-data.service';
import { BcpUserService } from '../bcp-user.service';

@Component({
  selector: 'app-bcp-photos',
  templateUrl: './bcp-photos.component.html',
  styleUrls: ['./bcp-photos.component.scss']
})
export class BcpPhotosComponent implements OnInit {

  private _images: GalleryItem[];
  @ViewChild('fileinput') fileInput: ElementRef;


  @Input()
  set images(images: GalleryItem[]){
    this._images = images;
    this.updateImages();
  }

  get images():GalleryItem[]{
    return this._images;
  }

  files: string[];
  fileNumber: number

  @Output() newImage$: EventEmitter<FileList> = new EventEmitter<FileList>();

  galleryRef: GalleryRef;

  pbarFlag: boolean = false;
  pbarMode: string = "indeterminate";
  pbarProgress: number = 0;


  constructor(private gallery: Gallery,
              private storage: AngularFireStorage,
              private changeDetect: ChangeDetectorRef,
              private user: BcpUserService,
              private mapData: BcpMapDataService,
              private api: BcpApiService ) { }

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

  upload() {
    this.newImage$.next(this.fileInput.nativeElement.files);
  }

  send_file(files: FileList, folder: string, id: number) {
    this.pbarFlag = true;
    let imageRef
    let fileArray = Array.from(files)
    this.fileNumber = fileArray.length
    for (let file of fileArray) {
      let file_name = file.name;
      imageRef = `${folder}/${file_name}/original`;
      console.log ("uploading " + imageRef);
      let task = this.storage.upload(imageRef, file );
      task.percentageChanges().subscribe( progress => this.updateProgress(progress));
      task.snapshotChanges().subscribe(snapshot => this.fileSnapshot(snapshot, id))
    }
  }

  updateProgress(progress: number) {
    this.pbarMode = "determinate";
    this.pbarProgress = progress;
    this.changeDetect.detectChanges();
  }

  fileSnapshot(snapshot: any, id: number) {
    if (snapshot.state == "success"){
      let data = snapshot.metadata;
      data['id'] = id;
      this.user.current_user.getIdToken().then(token => {
        this.api.apiPost(token, this.api.ADDPHOTO, data ).subscribe( {next :response => {
            console.log(`Uploaded ${snapshot.metadata.fullPath}`)
            this.mapData.update(response)
        },
        error: e => console.error(e)})
      }
      )
    }
  }
}
