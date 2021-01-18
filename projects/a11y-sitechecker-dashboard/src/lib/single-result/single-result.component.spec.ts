import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleResultComponent } from './single-result.component';
import { SortByImpactPipe } from '../sortByImpact.pipe';

describe('SingleResultComponent', () => {
    let component: SingleResultComponent;
    let fixture: ComponentFixture<SingleResultComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SingleResultComponent, SortByImpactPipe],
            providers: [SortByImpactPipe],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleResultComponent);
        component = fixture.componentInstance;
        component.singleResult = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
