import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BcpDatabaseComponent } from './bcp-database.component';

describe('BcpDatabaseComponent', () => {
  let component: BcpDatabaseComponent;
  let fixture: ComponentFixture<BcpDatabaseComponent>;

  beforeEach(waitForAsync(() => {
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
