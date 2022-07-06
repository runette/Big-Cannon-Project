import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpListInputComponent } from './bcp-list-input.component';

describe('BcpListInputComponent', () => {
  let component: BcpListInputComponent;
  let fixture: ComponentFixture<BcpListInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BcpListInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BcpListInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
