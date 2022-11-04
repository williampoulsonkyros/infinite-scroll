import { AfterViewInit, Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { DataStatus as DataStatusRef, InfiniteScrollOptions } from 'src/app/directives/infinite-scroll-list.directive';

const DEFAULT_SCROLL_AREA_HEIGHT = 100
@Component({
  selector: 'app-infinite-scroll-list',
  templateUrl: './infinite-scroll-list.component.html',
  styleUrls: ['./infinite-scroll-list.component.scss'],
  exportAs: 'infinite-scroll'
})
export class InfiniteScrollListComponent implements AfterViewInit, OnInit {
  DataStatus = DataStatusRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void { }

  @Input() options: InfiniteScrollOptions
  @Input() enableDebug = false;
  @Input() getNextPageCallback: (pageSize: number, page: number) => Observable<any[]>;

  @ContentChild('body', { static: false }) bodyTemplateRef: TemplateRef<any>;
  @ContentChild('skeletonLoader', { static: false }) skeletonLoaderTemplateRef: TemplateRef<any>;

}
