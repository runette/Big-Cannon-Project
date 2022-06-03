import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BcpFilterValuesService {

  MATERIAL: string[] = ["All", "Not Known", "Cast Iron", "Wrought Iron", "Bronze", "Combined Cast and Wrought Iron"];
  RECORD_QUALITIES: string[] =  ["All", 'Observer', "Recorder", "Surveyor"];
  GUN_CATEGORIES: string[] = [ "All", "Not Known","Muzzle Loading", "Breech Loading", "Carronade"];  
  RECORD_STATUS: string[] = ["All", 'Unverified', 'Auto' , 'Verified']


  constructor() { }
}

export type Material =  "All" | "Not Known" | "Cast Iron" | "Wrought Iron" | "Bronze" | "Combined Cast and Wrought Iron";
export type RecordQuality =  'All' | 'Observer'| "Recorder" | "Surveyor";
export type GunCategory =  "All" | "Not Known" | "Muzzle Loading" | "Breech Loading" | "Carronade";  
export type RecordStatus = "All"| 'Unverified' | 'Auto' | 'Verified';
export type Order = "Order" | "Latest First" | "Oldest First" | "Alphabetic";
