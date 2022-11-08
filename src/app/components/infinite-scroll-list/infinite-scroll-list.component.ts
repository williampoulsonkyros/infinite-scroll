import { Component, ContentChild, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStatus as DataStatusRef, InfiniteScrollListDirective, InfiniteScrollOptions } from 'src/app/directives/infinite-scroll-list.directive';

const DEFAULT_SCROLL_AREA_HEIGHT = 100
@Component({
  selector: 'app-infinite-scroll-list',
  templateUrl: './infinite-scroll-list.component.html',
  styleUrls: ['./infinite-scroll-list.component.scss'],
  exportAs: 'infinite-scroll'
})
export class InfiniteScrollListComponent {
  DataStatus = DataStatusRef;

  @Input() query: any
  @Input() options: InfiniteScrollOptions
  @Input() getPage: (q: any, pageSize: number, page: number) => Observable<any[]>;
  @Input() enableDebug = false;

  // row template
  @ContentChild('row', { static: false }) rowTemplateRef: TemplateRef<any>;

  // end of data template
  @ContentChild('eod', { static: false }) eodTemplateRef: TemplateRef<any>;

  // row skeleton loader used when loaderStyle is 'many'
  @ContentChild('rowSkeleton', { static: false }) rowSkeletonTemplateRef: TemplateRef<any>;

  @ViewChild(InfiniteScrollListDirective) scroller: InfiniteScrollListDirective & ElementRef<InfiniteScrollListDirective>;

  
}
