import { AfterViewInit, Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStatus as DataStatusRef, InfiniteScrollOptions } from 'src/app/directives/infinite-scroll.directive';

const DEFAULT_SCROLL_AREA_HEIGHT = 100
@Component({
  selector: 'app-scroller-container',
  templateUrl: './scroller-container.component.html',
  styleUrls: ['./scroller-container.component.scss'],
  exportAs: 'scroll-container'
})
export class ScrollerContainerComponent implements AfterViewInit, OnInit {
  DataStatus = DataStatusRef;

  ngOnInit(): void {
  }
  
  scrollerOptions: InfiniteScrollOptions = {
    autoLoadFirstPage: true,
    scrollPercent: 100,
    scrollAreaHeight: 500,
    rowHeight: 100
  };

  ngAfterViewInit(): void { }

  @Input()
  public get scrollAreaHeight(): number {
    return this._scrollAreaHeight;
  }
  public set scrollAreaHeight(value: number) {
    this._scrollAreaHeight = value;
  }

  private _scrollAreaHeight: number = DEFAULT_SCROLL_AREA_HEIGHT;

  @Input() rowHeight;

  @Input() getNextPageCallback: (pageSize: number, page: number) => Observable<any[]>;

  @ContentChild('body', { static: false }) bodyTemplateRef: TemplateRef<any>;
  @ContentChild('skeletonLoader', { static: false }) skeletonLoaderTemplateRef: TemplateRef<any>;

}
