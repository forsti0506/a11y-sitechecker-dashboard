import { Pipe, PipeTransform } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';

@Pipe({
    name: 'sortByImpact',
    pure: true,
})
export class SortByImpactPipe implements PipeTransform {
    transform(
        violations: FullCheckerSingleResult[] | undefined,
        filter: string[] | undefined,
        type: string | undefined,
    ): FullCheckerSingleResult[] {
        if (!violations) return [];
        if (type === 'inapplicables') return violations;
        let returnValue: FullCheckerSingleResult[] = deepCopy(violations);
        returnValue.sort((a, b) => {
            if (a.impact === b.impact) return 0;
            if (a.impact === 'critical') return -1;
            if (b.impact === 'critical') return 1;
            if (a.impact === 'serious') return -1;
            if (b.impact === 'serious') return 1;
            if (a.impact === 'moderate') return -1;
            if (b.impact === 'moderate') return 1;
            return 0;
        });
        if (filter && filter.length > 0) {
            for (const violation of returnValue) {
                violation.nodes = violation.nodes.filter((i) => filter.some((s) => i.targetResult.urls.includes(s)));
            }
        }

        returnValue = returnValue.filter((f) => f.nodes.length > 0);
        return returnValue;
    }
}

export const deepCopy = <T>(target: T): T => {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
        const cp = [] as any[];
        (target as any[]).forEach((v) => {
            cp.push(v);
        });
        return cp.map((n: any) => deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
        const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
        Object.keys(cp).forEach((k) => {
            cp[k] = deepCopy<any>(cp[k]);
        });
        return cp as T;
    }
    return target;
};
