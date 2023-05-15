import { Component, OnInit, Input, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';


@Component({
  selector: 'app-bcp-list-input',
  templateUrl: './bcp-list-input.component.html',
  styleUrls: ['./bcp-list-input.component.scss']
})
export class BcpListInputComponent implements OnInit {

  @Input()
  list: string[] = [];

  @Input()
  label: string;

  @Input()
  placeholder: string;

  @Output()
  updateList: EventEmitter<string[]> = new EventEmitter<string[]>();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor() { }

  ngOnInit(): void {
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.list.push(value);
          this.updateList.next(this.list);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(item: string): void {
    const index = this.list.indexOf(item);

    if (index >= 0) {
      this.list.splice(index, 1);
    }
    this.updateList.next(this.list);
  }
}

@Pipe({name: 'UrlProcess'})
export class UrlProcessPipe implements PipeTransform {
  transform(value: string):string {
    return new URL(value).hostname.replace('www.','')
  }
}

