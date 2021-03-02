import { Injectable } from '@angular/core';
import { merge, Observable, of, zip } from 'rxjs';
import { A11ySitecheckerResult, FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';
import { HttpClient } from '@angular/common/http';
import { SiteResult } from './models/site-result';
import { concatAll, map, mergeAll, mergeMap, publishReplay, refCount, switchMap, zipAll } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';

export interface AnalyzedSite {
    _id: string;
    url: string;
    files: string[];
}

@Injectable({
    providedIn: 'root',
})
export class A11ySitecheckerDashboardService {
    public serverMode = true;
    violations = new Map<string, Observable<FullCheckerSingleResult[]>>();
    incompletes = new Map<string, Observable<FullCheckerSingleResult[]>>();
    inapplicables = new Map<string, Observable<FullCheckerSingleResult[]>>();
    passes = new Map<string, Observable<FullCheckerSingleResult[]>>();

    constructor(private httpClient: HttpClient) {}
    getWebsiteResultsNames(): Observable<AnalyzedSite[]> {
        if (this.serverMode) {
            return this.httpClient.get<AnalyzedSite[]>('http://localhost:4201/sites');
        } else {
            return this.httpClient.get<AnalyzedSite[]>('assets/results/dashboard/files.json');
        }
    }

    getSiteResults(site: AnalyzedSite): Observable<SiteResult[]> {
        if (this.serverMode) {
            return this.httpClient.get<SiteResult[]>('http://localhost:4201/siteResults/' + site._id);
        } else {
            const result: Observable<SiteResult>[] = [];
            const i = 0;
            for (const f of site.files) {
                result.push(this.httpClient.get<SiteResult>(f.replace('src/', '')));
            }

            return of(result).pipe(mergeMap((f) => zip(...f)));
        }
    }

    getViolations(
        id: string | undefined,
        timestamp: string | undefined,
    ): Observable<FullCheckerSingleResult[]> | undefined {
        if (!id || !timestamp) return undefined;
        if (!this.violations.get(id + timestamp)) {
            if (this.serverMode) {
                this.violations.set(
                    id + timestamp,
                    this.httpClient
                        .post<FullCheckerSingleResult[]>('http://localhost:4201/violations/' + id, {
                            data: timestamp,
                        })
                        .pipe(publishReplay(1), refCount()),
                );
            } else {
                this.violations.set(
                    id + timestamp,
                    this.httpClient
                        .get<FullCheckerSingleResult[]>(
                            'assets/results/dashboard/' + this.getEscaped(id + timestamp) + '_violations.json',
                        )
                        .pipe(publishReplay(1), refCount()),
                );
            }
        }
        return this.violations.get(id + timestamp);
    }
    getIncompletes(
        id: string | undefined,
        timestamp: string | undefined,
    ): Observable<FullCheckerSingleResult[]> | undefined {
        if (!id || !timestamp) return undefined;
        if (!this.incompletes.get(id + timestamp)) {
            if (this.serverMode) {
                this.incompletes.set(
                    id + timestamp,
                    this.httpClient
                        .post<FullCheckerSingleResult[]>('http://localhost:4201/incompletes/' + id, {
                            data: timestamp,
                        })
                        .pipe(publishReplay(1), refCount()),
                );
            } else {
                this.incompletes.set(
                    id + timestamp,
                    this.httpClient
                        .get<FullCheckerSingleResult[]>(
                            'assets/results/dashboard/' + this.getEscaped(id + timestamp) + '_incompletes.json',
                        )
                        .pipe(publishReplay(1), refCount()),
                );
            }
        }
        return this.incompletes.get(id + timestamp);
    }
    getInapplicables(
        id: string | undefined,
        timestamp: string | undefined,
    ): Observable<FullCheckerSingleResult[]> | undefined {
        if (!id || !timestamp) return undefined;
        if (!this.inapplicables.get(id + timestamp)) {
            if (this.serverMode) {
                this.inapplicables.set(
                    id + timestamp,
                    this.httpClient
                        .post<FullCheckerSingleResult[]>('http://localhost:4201/inapplicables/' + id, {
                            data: timestamp,
                        })
                        .pipe(publishReplay(1), refCount()),
                );
            } else {
                this.inapplicables.set(
                    id + timestamp,
                    this.httpClient
                        .get<FullCheckerSingleResult[]>(
                            'assets/results/dashboard/' + this.getEscaped(id + timestamp) + '_inapplicables.json',
                        )
                        .pipe(publishReplay(1), refCount()),
                );
            }
        }
        return this.inapplicables.get(id + timestamp);
    }
    getPasses(
        id: string | undefined,
        timestamp: string | undefined,
    ): Observable<FullCheckerSingleResult[]> | undefined {
        if (!id || !timestamp) return undefined;
        if (!this.passes.get(id + timestamp)) {
            if (this.serverMode) {
                this.passes.set(
                    id + timestamp,
                    this.httpClient
                        .post<FullCheckerSingleResult[]>('http://localhost:4201/passes/' + id, {
                            data: timestamp,
                        })
                        .pipe(publishReplay(1), refCount()),
                );
            } else {
                this.passes.set(
                    id + timestamp,
                    this.httpClient
                        .get<FullCheckerSingleResult[]>(
                            'assets/results/dashboard/' + this.getEscaped(id + timestamp) + '_passes.json',
                        )
                        .pipe(publishReplay(1), refCount()),
                );
            }
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
    getEscaped(link: string): string {
        return link.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\\[\]/]/gi, '_');
    }

    getViolationCoutings(site: AnalyzedSite | undefined): Observable<any[]> {
        if (this.serverMode && site) {
            return this.httpClient.get<Map<string, number>[]>('http://localhost:4201/siteResults/' + site._id);
        } else if (site) {
            const result: Observable<SiteResult>[] = [];
            for (const f of site.files) {
                result.push(this.httpClient.get<SiteResult>(f.replace('src/', '')));
            }

            return zip(...result).pipe(
                map((f) =>
                    f.map((t) => {
                        return this.httpClient.get<any>(
                            'assets/results/dashboard/' + this.getEscaped(t.id + t.timestamp) + '_violations.json',
                        );
                    }),
                ),
                flatMap((f) => zip(...f)),
            );
        }
        return of();
    }
}
