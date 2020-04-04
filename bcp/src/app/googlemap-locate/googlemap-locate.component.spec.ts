import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglemapLocateComponent } from './googlemap-locate.component';

describe('GooglemapLocateComponent', () => {
  let component: GooglemapLocateComponent;
  let fixture: ComponentFixture<GooglemapLocateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GooglemapLocateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemapLocateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
