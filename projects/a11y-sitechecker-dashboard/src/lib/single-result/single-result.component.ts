import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { A11ySitecheckerDashboardService } from '../a11y-sitechecker-dashboard.service';
import { SortByImpactPipe } from '../sortByImpact.pipe';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    constructor(private sitecheckerService: A11ySitecheckerDashboardService) {}

    ngOnInit(): void {
        if (this.type === 'violations') {
            this.sitecheckerService
                .getViolations(this.id, this.timestamp)
                ?.pipe(takeUntil(this.destroyed$))
                .subscribe((r) => {
                    this.violations = r;
                });
        } else if (this.type === 'incompletes') {
            this.sitecheckerService
                .getIncompletes(this.id, this.timestamp)
                ?.pipe(takeUntil(this.destroyed$))
                .subscribe((r) => {
                    this.violations = r;
                });
        } else if (this.type === 'inapplicables') {
            this.sitecheckerService
                .getInapplicables(this.id, this.timestamp)
                ?.pipe(takeUntil(this.destroyed$))
                .subscribe((r) => {
                    this.violations = r;
                });
        } else if (this.type === 'passes') {
            this.sitecheckerService
                .getPasses(this.id, this.timestamp)
                ?.pipe(takeUntil(this.destroyed$))
                .subscribe((r) => {
                    this.violations = r;
                });
        }
        this.countViolations.emit(this.violations?.length);
    }
    ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
    openImage(node: any): void {
        node['openImage'] = !node['openImage'];
        node['openAdvices'] = false;
        node.targetResult['open'] = false;
    }

    openUrls(node: any): void {
        node.targetResult['open'] = !node.targetResult['open'];
        node['openAdvices'] = false;
        node['openImage'] = false;
    }

    openAdvices(node: any): void {
        node['openAdvices'] = !node['openAdvices'];
        node['openImage'] = false;
        node.targetResult['open'] = false;
    }
}
