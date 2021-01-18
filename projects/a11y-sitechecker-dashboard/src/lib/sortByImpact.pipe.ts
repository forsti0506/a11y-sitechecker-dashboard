import { Pipe, PipeTransform } from '@angular/core';
import { FullCheckerSingleResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';

@Pipe({
    name: 'sortByImpact',
    pure: true,
})
export class SortByImpactPipe implements PipeTransform {
    transform(violations: FullCheckerSingleResult[], filter: string): FullCheckerSingleResult[] {
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
        if (filter) {
            for (const violation of returnValue) {
                violation.nodes = violation.nodes.filter((i) => i.targetResult.urls.includes(filter));
            }
        }

        returnValue = returnValue.filter((f) => f.nodes.length > 0);
        return returnValue;
    }
}

function deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepCopy(item);
            return arr;
        }, []);
    }

    if (obj instanceof Object) {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepCopy(obj[key]);
            return newObj;
        }, {});
    }
}
