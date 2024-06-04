import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { uploadBytesResumable,
        ref,
        StorageReference,
        Storage,
        UploadTaskSnapshot
} from '@angular/fire/storage';
import { BcpApiService,  } from '../bcp-api.service';
import { BcpMapDataService } from '../bcp-map-data.service';
import { BcpUserService } from '../bcp-user.service';

@Component({
  selector: 'app-bcp-photo-select',
  templateUrl: './bcp-photos.component.html',
  styleUrls: ['./bcp-photos.component.scss']
})
export class BcpPhotosComponent {

  @ViewChild('fileinput') fileInput: ElementRef;
  @Input() changeDetect: ChangeDetectorRef;

  files: string[];
  fileNumber: number;

  @Output() newImage$: EventEmitter<FileList> = new EventEmitter<FileList>();

  pbarFlag: boolean = false;
  pbarMode: string = "indeterminate";
  pbarProgress: number = 0;
  progressHash: {[Key: string]: UploadTaskSnapshot} = {};


  constructor(private storage: Storage,
              private user: BcpUserService,
              private mapData: BcpMapDataService,
              private api: BcpApiService ) { }


  fileAdded() {
    this.newImage$.next(this.fileInput.nativeElement.files);
    this.pbarFlag = this.fileInput.nativeElement.files.length > 0;
  }

  send_file(folder: string, id: number) {
    if (! this.pbarFlag ) return;
    let imageRef: StorageReference
    let fileArray = Array.from(this.fileInput.nativeElement.files as FileList)
    this.fileNumber = fileArray.length
    for (let file of fileArray) {
      let file_name = file.name;
      imageRef = ref(this.storage, `${folder}/${file_name}/original`);
      console.log ("uploading " + imageRef);
      let task = uploadBytesResumable(imageRef, file );
      task.on( "state_changed", snapshot => {
        this.updateProgress(snapshot);
        this.changeDetect.detectChanges();
      })
      task.then(snapshot => this.fileSnapshot(snapshot, id)
      )
    }
  }

  updateProgress(snapshot: UploadTaskSnapshot): number {
    let ref = snapshot.ref.fullPath;
    this.progressHash[ref] = snapshot;
    let total = 0, done = 0;
    for (let key in this.progressHash) {
      let prog = this.progressHash[key];
      total += prog.totalBytes;
      done += prog.bytesTransferred
    }
    return done / total * 100
  }

  fileSnapshot(snapshot: any, id: number) {
    if (snapshot.state == "success"){
      this.updateProgress(snapshot);
      let data = snapshot.metadata;
      if (data.ref) {
        data['id'] = id;
        this.user.current_user.getIdToken().then(token => {
          this.api.apiPost(token, this.api.ADDPHOTO, data ).subscribe( {next :response => {
              console.log(`Uploaded ${snapshot.metadata.fullPath}`)
              this.mapData.update(response)
            },
            error: e => console.error(e)
          })
        })
      }
    }
  }
}
