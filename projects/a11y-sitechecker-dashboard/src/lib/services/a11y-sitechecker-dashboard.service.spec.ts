import { TestBed } from '@angular/core/testing';

import { A11ySitecheckerDashboardService } from './a11y-sitechecker-dashboard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('A11ySitecheckerDashboardService', () => {
    let service: A11ySitecheckerDashboardService;
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [],
        }).compileComponents(),
    );

    beforeEach(() => (service = TestBed.inject(A11ySitecheckerDashboardService)));

    it('should be created', async () => {
        expect(service).toBeTruthy();
    });
});
