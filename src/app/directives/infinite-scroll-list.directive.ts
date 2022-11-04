
import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { exhaustMap, filter, map, pairwise, startWith, tap } from 'rxjs/operators';

interface ScrollPosition {
    sH: number;
    sT: number;
    cH: number;
};

export interface InfiniteScrollOptions {

    // automatically load the first page of data when the component is rendered
    autoLoadFirstPage: boolean;

    // percentage of vertical scroll before the next page of data tries to load
    scrollPercent: number;

    // height of the scroll region in pixels
    scrollAreaHeight: number;

    // height of the result row containers
    rowHeight: number;

    // override the optimal minimum calculated page size
    overridePageSize?: number;
}

const DEFAULT_SCROLL_POSITION: ScrollPosition = {
    sH: 0,
    sT: 0,
    cH: 0
};

export enum DataStatus {
    INIT,
    IDLE,
    LOADING,
    EOD
}

const BROWSER_SCROLL_EVENT = 'scroll';

@Directive({
    selector: '[appInfiniteScroller]',
    exportAs: 'scroller'
})
export class InfiniteScrollListDirective
    implements AfterViewInit, OnDestroy, OnInit {

    status: DataStatus;
    data = [];
    
    private directiveEffects: Subscription;
    private pageSize = -1;
    private pageNumber = 0;

    @HostBinding('style.height')
    height: string = '0px';

    @Input()
    getNextPageCallback: (pageSize: number, page: number) => Observable<any[]>;

    @Input()
    options: InfiniteScrollOptions


    constructor(private elm: ElementRef) { }

    ngOnInit(): void {
        this.pageSize =
            this.options.overridePageSize
            ?? this.calculateOptimalPageSizeForRenderRegion();

        this.height = `${this.options.scrollAreaHeight ?? 0}px`;
    }

    ngOnDestroy(): void {
        this.directiveEffects.unsubscribe();
    }

    ngAfterViewInit() {
        const onScrollDown$ = this.getScrollDownEvent$();

        this.directiveEffects =
            combineLatest([
                this.createBehaviorLoadNextPageOnScroll$(onScrollDown$)
            ]).subscribe();
    }

    private calculateOptimalPageSizeForRenderRegion() {
        const visibleItemCountEstimate = this.options.scrollAreaHeight / this.options.rowHeight;
        let optimalPageSize = 1.1 * visibleItemCountEstimate;
        optimalPageSize = Math.round(optimalPageSize + Number.EPSILON);
        return optimalPageSize;
    }

    private getScrollDownEvent$() {
        const useScrollContainer = this.options.scrollAreaHeight > 0;
        const onScroll$ = this.getScrollEventSource$(useScrollContainer);
        return this.createEventOnScrolledDown$(onScroll$);
    }

    private getScrollEventSource$(useScrollContainer: boolean) {
        return useScrollContainer
            ? this.getElementScrollEvent$()
            : this.getWindowScrollEvent$();
    }

    private getWindowScrollEvent$() {
        return fromEvent(window.document, BROWSER_SCROLL_EVENT)
            .pipe(
                map((e: any): ScrollPosition => {
                    const target = e.target['scrollingElement'];
                    return ({
                        sH: target.scrollHeight,
                        sT: target.scrollTop + e.target.clientHeight,
                        cH: target.clientHeight
                    });
                })
            );
    }

    private getElementScrollEvent$() {
        return fromEvent(this.elm.nativeElement, BROWSER_SCROLL_EVENT)
            .pipe(
                map((e: any): ScrollPosition => {
                    return ({
                        sH: e.target.scrollHeight,
                        sT: e.target.scrollTop,
                        cH: e.target.clientHeight
                    });
                })
            );
    }

    private createEventOnScrolledDown$(scrollEvent$) {
        return scrollEvent$
            .pipe(
                pairwise(),
                tap(v => { console.log(v[1]) }),
                filter(positions => [
                    this.isUserScrollingDown(positions),
                    this.isScrollExpectedPercent(positions[1])
                ].indexOf(false) === -1)
            )
    }

    private createBehaviorLoadNextPageOnScroll$(scrollDownEvent$) {
        return this.createScroller(scrollDownEvent$)
            .pipe(
                tap((e) => { console.log(e) }),

                filter(() => this.status !== DataStatus.EOD),
                tap(() => { this.status = DataStatus.LOADING; }),
                exhaustMap(() => this.getNextPageCallback(this.pageSize, this.pageNumber++)),
                tap((dataPage) => {
                    this.data.push(...dataPage)
                    this.status = !dataPage.length
                        ? DataStatus.EOD
                        : DataStatus.IDLE;
                })
            )
    }

    private isUserScrollingDown = (positions) => {
        return positions[0].sT < positions[1].sT;
    }

    private isScrollExpectedPercent = (position) => {
        return ((position.sT + position.cH) / position.sH) >= (this.options.scrollPercent / 100);
    }

    private createScroller(scrollDownEvent$: any): Observable<any> {
        return this.options.autoLoadFirstPage
            ? scrollDownEvent$.pipe(startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION]))
            : scrollDownEvent$;
    }
}