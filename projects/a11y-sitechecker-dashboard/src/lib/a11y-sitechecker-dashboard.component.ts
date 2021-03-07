import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { A11ySitecheckerDashboardService, AnalyzedSite } from './services/a11y-sitechecker-dashboard.service';
import { SiteResult } from './models/site-result';
import { ReplaySubject } from 'rxjs';
import { map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { NodeResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';

@Component({
    selector: 'sitechecker-dashboard',
    templateUrl: './a11y-sitechecker-dashboard.component.html',
    styleUrls: ['./a11y-sitechecker-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class A11ySitecheckerDashboardComponent implements OnInit, OnDestroy {
    @Input()
    serverMode = true;
    @Input()
    showToolbar = true;
    @Input()
    showFooter = true;

    showChart = 'general';
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    analyzedSites: AnalyzedSite[] | undefined;
    chart = new Chart({
        chart: {
            type: 'line',
            height: '20%',
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

    results: SiteResult[] = [];
    loaded = false;
    activeUrl: string | undefined;
    chosenFilters: string[] = [];
    selectedSite = 'okay';

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
                this.siteChanged(0);
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    siteChanged(siteIndex: number): void {
        if (this.analyzedSites) {
            this.activeUrl = this.analyzedSites[siteIndex].url;
            this.sitecheckerService
                .getSiteResults(this.analyzedSites[siteIndex])
                .pipe(takeUntil(this.destroyed$))
                .subscribe(
                    (s) => {
                        this.results = s;

                        this.updateChart();
                        this.loaded = true;
                    },
                    (error) => {
                        console.log(error);
                        this.results = [];
                        this.loaded = false;
                    },
                );
        }
    }

    updateChart(): void {
        const dataViolations: number[] = [];
        const dataIncomplete: number[] = [];
        const dataInapplicable: number[] = [];
        const dataPasses: number[] = [];
        const dataAnalyzedUrls: number[] = [];
        this.chart.ref$.pipe(takeUntil(this.destroyed$)).subscribe((c) => {
            while (c.series.length > 0) {
                c.series[0].remove();
            }
            this.results.forEach((f) => {
                c.title.update({ text: 'General overview' }, false);
                dataViolations.push(f.countViolations);
                const dateTime = new Date(f.timestamp);
                c.xAxis[0].setCategories(
                    c.xAxis[0].categories.concat(
                        dateTime.getDate().toString().padStart(2, '0') +
                            '.' +
                            (dateTime.getMonth() + 1).toString().padStart(2, '0') +
                            ' ' +
                            dateTime.getHours().toString().padStart(2, '0') +
                            ':' +
                            dateTime.getMinutes().toString().padStart(2, '0'),
                    ),
                    false,
                );
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
                false,
                true,
            );
            this.chart.addSeries(
                {
                    name: 'incomplete',
                    type: 'line',
                    data: dataIncomplete,
                    color: 'orange',
                },
                false,
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
                false,
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
                false,
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
        });
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

    loadViolationDevelopment(event: MatButtonToggleChange): void {
        if (event.value === 'general') {
            this.updateChart();
        } else {
            if (this.analyzedSites) {
                this.chart.ref$
                    .pipe(
                        map((c) => {
                            c.title.update({ text: 'Violations by Url' }, false);
                            while (c.series.length > 0) {
                                c.series[0].remove();
                            }
                        }),
                        mergeMap(() =>
                            this.sitecheckerService
                                .getViolationCoutings(this.analyzedSites?.filter((f) => f.url === this.activeUrl)[0])
                                .pipe(takeUntil(this.destroyed$))
                                .pipe(
                                    switchMap((f) => {
                                        const violationsMap: Map<string, number>[] = [];
                                        let i = 1;
                                        for (const a of f) {
                                            if (i === f.length) {
                                                const aMap: Map<string, number> = new Map<string, number>();
                                                for (const elem of a) {
                                                    elem.nodes.forEach((node: NodeResult) => {
                                                        node.targetResult.urls.forEach((t: string) => {
                                                            const entry = aMap.get(t);
                                                            if (entry) {
                                                                aMap.set(t, entry + 1);
                                                            } else {
                                                                aMap.set(t, 1);
                                                            }
                                                        });
                                                    });
                                                }
                                                violationsMap.push(aMap);
                                            } else {
                                                const aMap: Map<string, number> = new Map<string, number>();
                                                for (const value in a) {
                                                    aMap.set(value, a[value]);
                                                }
                                                violationsMap.push(aMap);
                                                i++;
                                            }
                                        }
                                        i = 0;
                                        const mappinger: Map<string, number[]> = new Map<string, number[]>();
                                        for (const v of violationsMap) {
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
                                            i++;
                                            mappinger.forEach((b, key) => {
                                                if (b.length < i) b.push(0);
                                            });
                                        }
                                        mappinger.forEach((k, v) => {
                                            this.chart.addSeries(
                                                {
                                                    name: v,
                                                    type: 'line',
                                                    data: k,
                                                    visible: false,
                                                },
                                                false,
                                                false,
                                            );
                                        });
                                        return this.chart.ref$;
                                    }),
                                ),
                        ),
                    )
                    .subscribe((c1) => {
                        c1.redraw();
                    });
            }
        }
    }
    trackBySiteResult(index: number, siteResult: SiteResult): string {
        return siteResult.id;
    }
}
