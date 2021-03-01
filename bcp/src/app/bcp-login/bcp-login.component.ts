import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bcp-login',
  templateUrl: './bcp-login.component.html',
  styleUrls: ['./bcp-login.component.css']
})
export class BcpLoginComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  success(event) {
    console.log('success');
    console.log(event);
  }

  error(event) {
    console.log('error');
    console.error(event);
  }
}
