import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class BcpUserService {

  user: BcpUser;
  login: boolean = false;

  constructor(private auth: AngularFireAuth ) { 
    this.user = new BcpUser('1');
    this.login = true;
  }
}

export class BcpUser {
  name: string;
  id: string;
  fireUserData?: string;
  standing: BcpUserStanding;
  test_user: boolean;
  token?: string;

  constructor(id: string) {
    this.id = id;
    this.name = "name";
    this.standing = "OBSERVER"
    this.test_user = false;
  }
}

export type BcpUserStanding = "OBSERVER" | "RECORDER" | "SURVEYOR" | "ADMIN";
