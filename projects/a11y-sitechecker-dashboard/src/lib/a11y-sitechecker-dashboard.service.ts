import { Injectable } from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { A11ySitecheckerResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { HttpClient } from '@angular/common/http';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import * as url from 'url';

export interface DashboardFileList {
    url: string;
    files: string[];
}
@Injectable({
    providedIn: 'root',
})
export class A11ySitecheckerDashboardService {
    constructor(private httpClient: HttpClient) {}
    getWebsiteResultsNames(): Observable<DashboardFileList[]> {
        return this.httpClient.get<DashboardFileList[]>('assets/results/dashboard/files.json');
    }

    getResult(activeUrl: string): Observable<A11ySitecheckerResult> {
        return this.httpClient.get<A11ySitecheckerResult>(activeUrl.replace('src/', ''));
    }
    //   const subscriptions$: Observable<A11ySitecheckerResult>[] = [];
    //   for (const file of this.files.filter((f) => f.length > 0)) {
    //     subscriptions$.push(this.httpClient.get<A11ySitecheckerResult>('assets/results/dashboard/' + file));
    //   }
    //   concat(...subscriptions$).subscribe(
    //     (result) => {
    //       if (this.results.filter((r) => r.url === result.url).length > 0) {
    //         this.results.filter((r) => r.url === result.url)[0].results.push(result);
    //       } else {
    //         this.results.push({ url: result.url, results: [result] });
    //       }
    //     },
    //     (error) => {
    //       console.log(error);
    //     },
    //     () => {
    //       this.activeLink = this.results[0].url;
    //       this.updateChart(this.activeLink);
    //     },
    //   );
    // });
}
