import { TestBed } from '@angular/core/testing';

import { A11ySitecheckerDashboardService } from './a11y-sitechecker-dashboard.service';

describe('A11ySitecheckerDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: A11ySitecheckerDashboardService = TestBed.get(A11ySitecheckerDashboardService);
    expect(service).toBeTruthy();
  });
});
