import { AfterViewInit, Component, QueryList, ViewChildren } from '@angular/core';
import { delay, map, of, range, toArray } from 'rxjs';
import { InfiniteScrollListComponent } from './components/infinite-scroll-list/infinite-scroll-list.component';
import { InfiniteScrollOptions } from './directives/infinite-scroll-list.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit(): void {
  }

  title = 'infinite-scroll';
  lastResultIndex = 0;

  queryText: string;
  @ViewChildren(InfiniteScrollListComponent) scrollers: QueryList<InfiniteScrollListComponent>

  scrollerOptions: InfiniteScrollOptions = {
    autoLoadFirstPage: true,
    scrollPercent: 70,
    scrollAreaHeight: 800,
    rowHeight: 100,
    overridePageSize: 50,
    enableLog: true,
    loaderStyle: 'single',
    hideScrollbar: true
  }

  ddd(q) {
    this.lastResultIndex = 0;
    this.queryText = q;
  }

  getNextPageCallback = (q: any, pageSize: number, page: number) => {
    if (this.lastResultIndex > 500) {
      return of([])
    }
    return range(this.lastResultIndex, pageSize)
      .pipe(
        delay(2000),
        map(i => { return ({ title: `Title - ${this.lastResultIndex++}` }); }),
        toArray(),
      )
  }


}
