import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { A11ySitecheckerDashboardComponent } from './a11y-sitechecker-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('A11ySitecheckerDashboardComponent', () => {
    let component: A11ySitecheckerDashboardComponent;
    let fixture: ComponentFixture<A11ySitecheckerDashboardComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                declarations: [A11ySitecheckerDashboardComponent],
                providers: [HttpClientTestingModule],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(A11ySitecheckerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
