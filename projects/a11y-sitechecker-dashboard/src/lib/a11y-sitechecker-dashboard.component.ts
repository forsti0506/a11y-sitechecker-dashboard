import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { HttpClient } from '@angular/common/http';
import { A11ySitecheckerResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { concat, Observable } from 'rxjs';

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
    filters = [
        {
            name: 'critical',
            selected: false,
        },
        {
            name: 'wcag2aa',
            selected: false,
        },
    ];
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

    files: string[];
    results: DashboardResult[] = [];
    loaded = false;
    activeLink: string;
    constructor(private httpClient: HttpClient) {
        //test
    }

    ngOnInit(): void {
        this.httpClient.get('assets/results/dashboard/files.txt', { responseType: 'text' }).subscribe((data) => {
            this.files = data.replace(/\n/g, '').split(';');
            const subscriptions$: Observable<A11ySitecheckerResult>[] = [];
            for (const file of this.files.filter((f) => f.length > 0)) {
                subscriptions$.push(this.httpClient.get<A11ySitecheckerResult>('assets/results/dashboard/' + file));
            }
            concat(...subscriptions$).subscribe(
                (result) => {
                    if (this.results.filter((r) => r.url === result.url).length > 0) {
                        this.results.filter((r) => r.url === result.url)[0].results.push(result);
                    } else {
                        this.results.push({ url: result.url, results: [result] });
                    }
                },
                (error) => {
                    console.log(error);
                },
                () => {
                    this.activeLink = this.results[0].url;
                    this.updateChart(this.activeLink);
                },
            );
        });
    }

    updateChart(url: string): void {
        const dataViolations = [];
        const dataIncomplete = [];
        const dataInapplicable = [];
        const dataPasses = [];
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.chart.removeSeries(0);
        this.results
            .filter((r) => r.url === url)[0]
            .results.forEach((f) => {
                let absoluteCount = 0;
                f.violations.every((v) => (absoluteCount += v.nodes.length));
                dataViolations.push([absoluteCount]);
                this.chart.ref$.subscribe((c) => {
                    c.xAxis[0].setCategories(c.xAxis[0].categories.concat(new Date(f.timestamp).toLocaleString()));
                });
            });
        this.results
            .filter((r) => r.url === url)[0]
            .results.forEach((f) => {
                let absoluteCount = 0;
                f.incomplete.every((v) => (absoluteCount += v.nodes.length));
                dataIncomplete.push([absoluteCount]);
            });
        this.results
            .filter((r) => r.url === url)[0]
            .results.forEach((f) => {
                let absoluteCount = 0;
                f.inapplicable.every((v) => (absoluteCount += v.nodes.length));
                dataInapplicable.push([absoluteCount]);
            });
        this.results
            .filter((r) => r.url === url)[0]
            .results.forEach((f) => {
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
    }

    sortResultByDate(results: DashboardResult[]): A11ySitecheckerResult[] {
        return results
            .filter((f) => f.url === this.activeLink)[0]
            .results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    selectFilter(filter: { name: string; selected: boolean }): void {
        filter.selected = true;
    }
}
