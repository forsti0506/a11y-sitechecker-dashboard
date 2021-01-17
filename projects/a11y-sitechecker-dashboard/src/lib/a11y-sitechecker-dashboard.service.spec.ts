import { TestBed } from '@angular/core/testing';

import { A11ySitecheckerDashboardService } from './a11y-sitechecker-dashboard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('A11ySitecheckerDashboardService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClientTestingModule],
        }),
    );

    it('should be created', () => {
        const service: A11ySitecheckerDashboardService = TestBed.get(A11ySitecheckerDashboardService);
        expect(service).toBeTruthy();
    });
});
