import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Auth,
  authState,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bcp-login',
  templateUrl: './bcp-login.component.html',
  styleUrls: ['./bcp-login.component.css']
})
export class BcpLoginComponent implements OnInit, OnDestroy {

  currentUser: User | undefined;
  displayName: string = "";
  email: string | undefined;
  password: string | undefined;
  error: boolean = false;
  hide: boolean = true;

  loggedOut: boolean = true;
  private subscriptions: Subscription[] = [];

  constructor(    
    @Optional() private auth: Auth,
    ) {
    if (auth) {
      this.subscriptions.push(authState(this.auth).subscribe(user => {
        if (user) {
          this.loggedOut = false;
          this.currentUser = user;
          this.displayName = user.providerData[0].displayName ?
                                user.providerData[0].displayName :
                                user.providerData[0].email
                              ? user.providerData[0].email : "";

        } else {
          this.currentUser = undefined;
          this.displayName = "";
          this.loggedOut = true;
        }
      }));
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub => sub.unsubscribe());
  }

  async loginGoogle() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async loginEmail() {
    if ( this.email == undefined || this.password == undefined) return;
    try {
      this.error = false;
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
    } catch (e) {
      this.error = true;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  async register() {
    if ( this.email == undefined ||
         this.password == undefined ||
         this.auth == undefined) return;
    try {
      this.error = false;
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      if ( this.auth.currentUser ) await sendEmailVerification(this.auth.currentUser)
    } catch (e) {
      this.error = true
    }
  }
}
