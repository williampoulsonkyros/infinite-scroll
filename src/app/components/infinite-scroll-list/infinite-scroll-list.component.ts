import { AfterViewInit, Component, ContentChild, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, exhaustMap, filter, firstValueFrom, fromEvent, map, Observable, pairwise, range, startWith, Subscription, take, tap, toArray } from 'rxjs';


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

  // output log to console
  enableLog?: boolean

  // one loader or many
  loaderStyle: 'single' | 'many'

  // hide the scroll bar in the container
  hideScrollbar?: boolean
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

const DEFAULT_SCROLL_AREA_HEIGHT = 100
@Component({
  selector: 'app-infinite-scroll-list',
  templateUrl: './infinite-scroll-list.component.html',
  styleUrls: ['./infinite-scroll-list.component.scss'],
  exportAs: 'infinite-scroll'
})
export class InfiniteScrollListComponent
  implements AfterViewInit, OnDestroy, OnInit {
  DataStatus = DataStatus;

  @Input() options: InfiniteScrollOptions
  @Input() getPage: (q: any, pageSize: number, page: number) => Observable<any[]>;
  @Input()
  public get query(): any {
    return this._query;
  }
  public set query(value: any) {
    this._query = value;
    this.reset();
  }
  private _query: any;

  // row template
  @ContentChild('row', { static: false }) rowTemplateRef: TemplateRef<any>;

  // end of data template
  @ContentChild('eod', { static: false }) eodTemplateRef: TemplateRef<any>;

  // loader template
  @ContentChild('rowSkeleton', { static: false }) rowSkeletonTemplateRef: TemplateRef<any>;

  // scroll container element
  @ViewChild('infiniteContainer') scrollContainer: ElementRef;



  status: DataStatus;
  data = [];
  skeletons = []
  height: string = '0px';


  private internalReload = new BehaviorSubject<any>(null);
  private clearCount: 0;
  private directiveEffects: Subscription;
  private pageSize = 0;
  private pageNumber = 0;

  
  reset() {
    this.data = [];
    this.pageNumber = 0;
    this.status = DataStatus.IDLE;
    this.internalReload.next(this.clearCount++)
  }

  goToTop() {
    this.scrollContainer.nativeElement.scrollTop = 0;
  }

  async ngOnInit(): Promise<void> {
    this.pageSize =
      this.options.overridePageSize
      ?? this.calculateOptimalPageSizeForRenderRegion();

    this.height = `${this.options.scrollAreaHeight ?? 0}px`;
    this.skeletons = await this.createSkeletons();
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

  isLoading() {
    return this.status === DataStatus.LOADING
  }
  
  isEOD() {
    return this.status === DataStatus.EOD
  }


  private async createSkeletons(): Promise<number[]> {
    return firstValueFrom(range(0, this.pageSize).pipe(take(this.pageSize / 2), toArray()));
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
    return fromEvent(this.scrollContainer.nativeElement, BROWSER_SCROLL_EVENT)
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
        tap(v => { this.log(v[1]) }),
        filter(positions => [
          this.isUserScrollingDown(positions),
          this.isScrollExpectedPercent(positions[1])
        ].indexOf(false) === -1)
      )
  }

  private createBehaviorLoadNextPageOnScroll$(scrollDownEvent$) {
    return combineLatest([
      this.createScroller$(scrollDownEvent$),
      this.internalReload,
    ])
      .pipe(
        filter(() => this.status !== DataStatus.EOD),
        tap(() => {
          this.status = DataStatus.LOADING;
          this.log({
            status: this.status,
            startIndex: this.data.length
          });
        }),
        exhaustMap(() => this.getPage(this.query, this.pageSize, this.pageNumber++)),
        tap((dataPage) => {
          this.data.push(...dataPage)
          this.status = !dataPage.length
            ? DataStatus.EOD
            : DataStatus.IDLE;

          this.log({
            status: this.status,
            query: this.query,
            pageNumber: this.pageNumber,
            page: dataPage
          });

        })
      )
  }

  private isUserScrollingDown = (positions) => {
    return positions[0].sT < positions[1].sT;
  }

  private isScrollExpectedPercent = (position) => {
    return ((position.sT + position.cH) / position.sH) >= (this.options.scrollPercent / 100);
  }

  private createScroller$(scrollDownEvent$: any): Observable<any> {
    return this.options.autoLoadFirstPage
      ? scrollDownEvent$.pipe(startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION]))
      : scrollDownEvent$;
  }

  private log(data: any) {
    if (this.options.enableLog) {
      console.log('infinite-scroll:', data)
    }
  }
}
