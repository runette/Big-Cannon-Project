import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcpDatabaseComponent } from './bcp-database.component';

describe('BcpDatabaseComponent', () => {
  let component: BcpDatabaseComponent;
  let fixture: ComponentFixture<BcpDatabaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcpDatabaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcpDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
