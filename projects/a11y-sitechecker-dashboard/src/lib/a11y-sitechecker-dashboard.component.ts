import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { A11ySitecheckerResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { A11ySitecheckerDashboardService, AnalyzedSite } from './a11y-sitechecker-dashboard.service';
import { SiteResult } from './models/site-result';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    @Input()
    serverMode = true;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    analyzedSites: AnalyzedSite[] | undefined;
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

    chartViolationDevelopment = new Chart({
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
            text: 'Violation Development',
        },

        credits: {
            enabled: false,
        },
        xAxis: {
            categories: [],
        },
    });

    results: SiteResult[] = [];
    loaded = false;
    activeLink: string | undefined;
    chosenFilters: string[] = [];

    constructor(private sitecheckerService: A11ySitecheckerDashboardService) {
        //test
    }

    ngOnInit(): void {
        this.sitecheckerService.serverMode = this.serverMode;

        this.sitecheckerService
            .getWebsiteResultsNames()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((sites) => {
                this.analyzedSites = sites;
                this.activeLink = sites[0].url;
                this.siteChanged(sites[0]);
            });
    }

    ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    siteChanged(site: AnalyzedSite): void {
        this.sitecheckerService
            .getSiteResults(site)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((s) => {
                this.results = s;
                this.updateChart();
            });
    }

    updateChart(): void {
        const dataViolations: number[] = [];
        const dataIncomplete: number[] = [];
        const dataInapplicable: number[] = [];
        const dataPasses: number[] = [];
        const dataAnalyzedUrls: number[] = [];
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.results.forEach((f) => {
            dataViolations.push(f.countViolations);
            this.chart.ref$.pipe(takeUntil(this.destroyed$)).subscribe((c) => {
                c.xAxis[0].setCategories(c.xAxis[0].categories.concat(new Date(f.timestamp).toLocaleString()));
            });
        });
        this.results.forEach((f) => {
            dataIncomplete.push(f.countIncomplete);
        });
        this.results.forEach((f) => {
            dataInapplicable.push(f.countInapplicable);
        });
        this.results.forEach((f) => {
            dataPasses.push(f.countPasses);
        });
        this.results.forEach((f) => {
            dataAnalyzedUrls.push(f.analyzedUrls.length);
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
                visible: false,
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
                visible: false,
            },
            true,
            true,
        );

        this.chart.addSeries(
            {
                name: 'analyzedUrls',
                type: 'line',
                data: dataAnalyzedUrls,
                color: 'black',
            },
            true,
            true,
        );
        this.loaded = true;
    }

    sortResultByDate(results: DashboardResult[]): A11ySitecheckerResult[] {
        return results
            .filter((f) => f.url === this.activeLink)[0]
            .results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    selectFilter(filter: { name: string; selected: boolean }): void {
        filter.selected = true;
    }

    applyFilter(url: string): void {
        if (this.chosenFilters?.includes(url)) {
            this.removeFilter(url);
        } else {
            this.chosenFilters.push(url);
            this.chosenFilters = [...this.chosenFilters];
        }
    }

    removeFilter(filter: string): void {
        this.chosenFilters?.forEach((item, index) => {
            if (item === filter) this.chosenFilters?.splice(index, 1);
        });
        this.chosenFilters = [...this.chosenFilters];
    }

    loadViolationDevelopment() {
        if (this.analyzedSites) {
            const data = [];
            this.sitecheckerService.getViolationCoutings(this.analyzedSites[0]).subscribe((f) => {
                const violationsMap: Map<string, number>[] = [];
                for (const a of f) {
                    const aMap: Map<string, number> = new Map<string, number>();
                    for (const value in a) {
                        aMap.set(value, a[value]);
                    }
                    violationsMap.push(aMap);
                }

                const mappinger: Map<string, number[]> = new Map<string, number[]>();
                let i = 0;
                for (const v of violationsMap) {
                    if (i < violationsMap.length - 1) {
                        v.forEach((b: number, k: string) => {
                            const current = mappinger.get(k);
                            if (current) {
                                current.push(b);
                            } else {
                                const filledNumbers = [];
                                for (let j = 0; j < i - 1; j++) {
                                    filledNumbers.push(0);
                                }
                                filledNumbers.push(b);
                                mappinger.set(k, filledNumbers);
                            }
                        });
                        mappinger.forEach((b, key) => {
                            if (b.length < i) b.push(0);
                        });
                        i++;
                    }
                }
                debugger;
            });
        }
    }
}
