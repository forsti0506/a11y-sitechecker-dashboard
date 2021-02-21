import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { A11ySitecheckerDashboardService } from '../a11y-sitechecker-dashboard.service';
import { SortByImpactPipe } from '../sortByImpact.pipe';

@Component({
    selector: 'app-single-result',
    templateUrl: './single-result.component.html',
    styleUrls: ['./single-result.component.css'],
})
export class SingleResultComponent implements OnInit {
    @Input() id: string | undefined;
    @Input() timestamp: string | undefined;
    @Input() chosenFilter: string[] | undefined;
    @Input() type: string | undefined;
    @Output() countViolations: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();
    violations: FullCheckerSingleResult[] | undefined;
    constructor(private sitecheckerService: A11ySitecheckerDashboardService, private sortbyImpact: SortByImpactPipe) {}

    ngOnInit(): void {
        if (this.type === 'violations') {
            this.sitecheckerService.getViolations(this.id, this.timestamp)?.subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'incompletes') {
            this.sitecheckerService.getIncompletes(this.id, this.timestamp)?.subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'inapplicables') {
            this.sitecheckerService.getInapplicables(this.id, this.timestamp)?.subscribe((r) => {
                this.violations = r;
            });
        } else if (this.type === 'passes') {
            this.sitecheckerService.getPasses(this.id, this.timestamp)?.subscribe((r) => {
                this.violations = r;
            });
        }
        this.countViolations.emit(this.violations?.length);
    }
}
