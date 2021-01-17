import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { A11ySitecheckerResult, FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { concat, Observable, zip } from 'rxjs';
import { A11ySitecheckerDashboardService, DashboardFileList } from './a11y-sitechecker-dashboard.service';
import { concatMap, map, mergeMap, switchMap, tap } from 'rxjs/operators';

interface DashboardResult {
    url: string;
    results: A11ySitecheckerResult[];
}
@Component({
    selector: 'sitechecker-dashboard',
    templateUrl: './a11y-sitechecker-dashboard.component.html',
    styleUrls: ['./a11y-sitechecker-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class A11ySitecheckerDashboardComponent implements OnInit {
    analyzedSites: string[];
    chart = new Chart({
        chart: {
            type: 'line',
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                },
            },
        },
        title: {
            text: 'Overview',
        },

        credits: {
            enabled: false,
        },
        xAxis: {
            categories: [],
        },
    });

    files: DashboardFileList[];
    results: A11ySitecheckerResult[] = [];
    loaded = false;
    activeLink: string;
    chosenFilter: string;
    constructor(private sitecheckerService: A11ySitecheckerDashboardService) {
        //test
    }

    ngOnInit(): void {
        this.sitecheckerService
            .getWebsiteResultsNames()
            .pipe(
                map((files) => {
                    this.analyzedSites = files.map((f) => f.url);
                    this.activeLink = this.analyzedSites[0];
                    this.files = files;
                    return files;
                }),
                map((files) => {
                    const results$: Observable<A11ySitecheckerResult>[] = [];
                    files
                        .filter((f) => f.url === this.activeLink)[0]
                        .files.forEach((f) => results$.push(this.sitecheckerService.getResult(f)));
                    return results$;
                }),
            )
            .pipe(mergeMap((f) => zip(...f)))
            .subscribe((f) => {
                this.results = f;
                this.updateChart();
            });
    }

    siteChanged(): void {
        const results$: Observable<A11ySitecheckerResult>[] = [];
        this.files
            .filter((f) => f.url === this.activeLink)[0]
            .files.forEach((f) => results$.push(this.sitecheckerService.getResult(f)));
        zip(...results$).subscribe((f) => {
            this.results = f;
            this.updateChart();
        });
    }

    updateChart(): void {
        const dataViolations = [];
        const dataIncomplete = [];
        const dataInapplicable = [];
        const dataPasses = [];
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.results.forEach((f) => {
            let absoluteCount = 0;
            f.violations.every((v) => (absoluteCount += v.nodes.length));
            dataViolations.push([absoluteCount]);
            this.chart.ref$.subscribe((c) => {
                c.xAxis[0].setCategories(c.xAxis[0].categories.concat(new Date(f.timestamp).toLocaleString()));
            });
        });
        this.results.forEach((f) => {
            let absoluteCount = 0;
            f.incomplete.every((v) => (absoluteCount += v.nodes.length));
            dataIncomplete.push([absoluteCount]);
        });
        this.results.forEach((f) => {
            let absoluteCount = 0;
            f.inapplicable.every((v) => (absoluteCount += v.nodes.length));
            dataInapplicable.push([absoluteCount]);
        });
        this.results.forEach((f) => {
            let absoluteCount = 0;
            f.passes.every((v) => (absoluteCount += v.nodes.length));
            dataPasses.push([absoluteCount]);
        });
        this.chart.addSeries(
            {
                name: 'violations',
                type: 'line',
                data: dataViolations,
                color: 'red',
            },
            true,
            true,
        );
        this.chart.addSeries(
            {
                name: 'incomplete',
                type: 'line',
                data: dataIncomplete,
                color: 'orange',
            },
            true,
            true,
        );
        this.chart.addSeries(
            {
                name: 'inapplicable',
                type: 'line',
                data: dataInapplicable,
                color: 'blue',
            },
            true,
            true,
        );
        this.chart.addSeries(
            {
                name: 'passes',
                type: 'line',
                data: dataPasses,
                color: 'green',
            },
            true,
            true,
        );
        this.loaded = true;
        this.loadAvailableCategories(this.results[0].violations);
    }

    sortResultByDate(results: DashboardResult[]): A11ySitecheckerResult[] {
        return results
            .filter((f) => f.url === this.activeLink)[0]
            .results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    selectFilter(filter: { name: string; selected: boolean }): void {
        filter.selected = true;
    }

    loadAvailableCategories(violations: FullCheckerSingleResult[]) {
        const tags: { name: string; selected: boolean }[] = [];
        for (const v of violations) {
            for (const t of v.tags) {
                if (tags.every((tag) => tag.name !== t)) {
                    tags.push({ name: t, selected: true });
                }
            }
        }
        // this.test.next(tags);
    }

    applyFilter(url: string): void {
        this.chosenFilter = url;
    }
}
