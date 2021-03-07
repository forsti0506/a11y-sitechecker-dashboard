// needed for material bug, with not beeing able to switch tabs with fixed height: https://github.com/angular/components/issues/9592
import { Directive, OnDestroy, ElementRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
    selector: '[fixedScrollingDirective]',
})
export class FixedScrollingDirective implements OnDestroy {
    private changes: MutationObserver;
    private lastScrollPosition = 0;
    private subscription: Subscription;

    constructor(private elementRef: ElementRef) {
        this.changes = new MutationObserver(() => this.rollbackScrollPosition());
        this.changes.observe(this.elementRef.nativeElement, { childList: true, subtree: true });
        this.subscription = fromEvent(window, 'scroll').subscribe(() => {
            this.lastScrollPosition = window.pageYOffset;
        });
    }

    private rollbackScrollPosition(): void {
        window.scrollTo(window.pageXOffset, this.lastScrollPosition);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.changes.disconnect();
    }
}
