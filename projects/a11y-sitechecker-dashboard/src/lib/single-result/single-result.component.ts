import { Component, Input, OnInit } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';

@Component({
    selector: 'app-single-result',
    templateUrl: './single-result.component.html',
    styleUrls: ['./single-result.component.css'],
})
export class SingleResultComponent implements OnInit {
    @Input() singleResult: FullCheckerSingleResult[];
    @Input() chosenFilter: string;
    constructor() {}

    ngOnInit(): void {}

    // sortByImpact(violations: FullCheckerSingleResult[]): FullCheckerSingleResult[] {
    //     violations.sort((a, b) => {
    //         if (a.impact === b.impact) return 0;
    //         if (a.impact === 'critical') return -1;
    //         if (b.impact === 'critical') return 1;
    //         if (a.impact === 'serious') return -1;
    //         if (b.impact === 'serious') return 1;
    //         if (a.impact === 'moderate') return -1;
    //         if (b.impact === 'moderate') return 1;
    //         return 0;
    //     });
    //     return violations;
    // }
}
