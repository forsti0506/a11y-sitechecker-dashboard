import { Component, Input, OnInit } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { A11ySitecheckerDashboardService } from '../a11y-sitechecker-dashboard.service';

@Component({
    selector: 'app-single-result',
    templateUrl: './single-result.component.html',
    styleUrls: ['./single-result.component.css'],
})
export class SingleResultComponent implements OnInit {
    @Input() id: string;
    @Input() timestamp: string;
    @Input() chosenFilter: string;
    @Input() type: string;
    violations: FullCheckerSingleResult[];
    constructor(private sitecheckerService: A11ySitecheckerDashboardService) {}

    ngOnInit(): void {
        if (this.type === 'violations') {
            this.sitecheckerService.getViolations(this.id, this.timestamp).subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'incompletes') {
            this.sitecheckerService.getIncompletes(this.id, this.timestamp).subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'inapplicables') {
            this.sitecheckerService.getInapplicables(this.id, this.timestamp).subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'passes') {
            this.sitecheckerService.getPasses(this.id, this.timestamp).subscribe((r) => {
                this.violations = r;
            });
        }
    }
}
