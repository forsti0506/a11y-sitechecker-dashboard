import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SiteResult } from '../models/site-result';
import { AnalyzedSite } from '../services/a11y-sitechecker-dashboard.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
    @Input() showToolbar = false;
    @Input() analyzedSites: AnalyzedSite[] | undefined;
    @Output() siteChanged: EventEmitter<number> = new EventEmitter<number>();
    constructor() {}

    ngOnInit(): void {}

    changeSite(siteIndex: number): void {
        this.siteChanged.emit(siteIndex);
    }

    trackBySiteId(index: number, analyzedSite: AnalyzedSite): string {
        return analyzedSite._id;
    }
}
