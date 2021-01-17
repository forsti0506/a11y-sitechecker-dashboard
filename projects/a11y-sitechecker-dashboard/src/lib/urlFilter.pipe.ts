import { Pipe, PipeTransform } from '@angular/core';
import { NodeResult } from 'a11y-sitechecker/lib/models/a11y-sitechecker-result';

@Pipe({
    name: 'urlfilter',
    pure: false,
})
export class UrlFilterPipe implements PipeTransform {
    transform(items: NodeResult[], filter: string): NodeResult[] {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter((i) => i.targetResult.urls.includes(filter));
    }
}
