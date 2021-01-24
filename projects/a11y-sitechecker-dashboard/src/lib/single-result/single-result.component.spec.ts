import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleResultComponent } from './single-result.component';
import { SortByImpactPipe } from '../sortByImpact.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SingleResultComponent', () => {
    let component: SingleResultComponent;
    let fixture: ComponentFixture<SingleResultComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [SingleResultComponent, SortByImpactPipe],
            providers: [SortByImpactPipe],
        }).compileComponents();
        fixture = TestBed.createComponent(SingleResultComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
