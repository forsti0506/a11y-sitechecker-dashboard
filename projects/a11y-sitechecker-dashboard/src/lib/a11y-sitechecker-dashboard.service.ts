import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { A11ySitecheckerResult, FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { HttpClient } from '@angular/common/http';
import { SiteResult } from './models/site-result';
import { publishReplay, refCount } from 'rxjs/operators';

export interface DashboardFileList {
    url: string;
    files: string[];
}
export interface AnalyzedSite {
    _id: string;
    url: string;
}

@Injectable({
    providedIn: 'root',
})
export class A11ySitecheckerDashboardService {
    serverMode = true;
    violations = new Map<string, Observable<FullCheckerSingleResult[]>>();
    incompletes = new Map<string, Observable<FullCheckerSingleResult[]>>();
    inapplicables = new Map<string, Observable<FullCheckerSingleResult[]>>();
    passes = new Map<string, Observable<FullCheckerSingleResult[]>>();

    constructor(private httpClient: HttpClient) {}
    getWebsiteResultsNames(): Observable<AnalyzedSite[]> {
        if (this.serverMode) {
            return this.httpClient.get<AnalyzedSite[]>('http://localhost:4201/sites');
        }
        // return this.httpClient.get<DashboardFileList[]>('assets/results/dashboard/files.json');
    }

    getSiteResults(id: string): Observable<SiteResult[]> {
        return this.httpClient.get<SiteResult[]>('http://localhost:4201/siteResults/' + id);
    }

    getViolations(id: string, timestamp: string): Observable<FullCheckerSingleResult[]> {
        if (!this.violations.get(id + timestamp)) {
            this.violations.set(
                id + timestamp,
                this.httpClient
                    .post<FullCheckerSingleResult[]>('http://localhost:4201/violations/' + id, {
                        data: timestamp,
                    })
                    .pipe(publishReplay(1), refCount()),
            );
        }
        return this.violations.get(id + timestamp);
    }
    getIncompletes(id: string, timestamp: string): Observable<FullCheckerSingleResult[]> {
        if (!this.incompletes.get(id + timestamp)) {
            this.incompletes.set(
                id + timestamp,
                this.httpClient
                    .post<FullCheckerSingleResult[]>('http://localhost:4201/incompletes/' + id, {
                        data: timestamp,
                    })
                    .pipe(publishReplay(1), refCount()),
            );
        }
        return this.incompletes.get(id + timestamp);
    }
    getInapplicables(id: string, timestamp: string): Observable<FullCheckerSingleResult[]> {
        if (!this.inapplicables.get(id + timestamp)) {
            this.inapplicables.set(
                id + timestamp,
                this.httpClient
                    .post<FullCheckerSingleResult[]>('http://localhost:4201/inapplicables/' + id, {
                        data: timestamp,
                    })
                    .pipe(publishReplay(1), refCount()),
            );
        }
        return this.inapplicables.get(id + timestamp);
    }
    getPasses(id: string, timestamp: string): Observable<FullCheckerSingleResult[]> {
        if (!this.passes.get(id + timestamp)) {
            this.passes.set(
                id + timestamp,
                this.httpClient
                    .post<FullCheckerSingleResult[]>('http://localhost:4201/passes/' + id, {
                        data: timestamp,
                    })
                    .pipe(publishReplay(1), refCount()),
            );
        }
        return this.passes.get(id + timestamp);
    }

    getResult(activeUrl: string): Observable<A11ySitecheckerResult> {
        if (this.serverMode) {
            return this.httpClient.get<A11ySitecheckerResult>('http://localhost:4201/result');
        } else {
            return this.httpClient.get<A11ySitecheckerResult>(activeUrl.replace('src/', ''));
        }
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
