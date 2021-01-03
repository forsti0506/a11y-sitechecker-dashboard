import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { A11ySitecheckerDashboardComponent } from './a11y-sitechecker-dashboard.component';

describe('A11ySitecheckerDashboardComponent', () => {
  let component: A11ySitecheckerDashboardComponent;
  let fixture: ComponentFixture<A11ySitecheckerDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ A11ySitecheckerDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(A11ySitecheckerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
