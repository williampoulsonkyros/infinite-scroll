import { Component, QueryList, ViewChildren } from '@angular/core';
import { delay, map, of, range, toArray } from 'rxjs';
import { InfiniteScrollListComponent, InfiniteScrollOptions } from './components/infinite-scroll-list/infinite-scroll-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'infinite-scroll';
  lastResultIndex = 0;
  private _queryText: string;
  public get queryText(): string {
    return this._queryText;
  }
  public set queryText(value: string) {
    this._queryText = value;
    this.lastResultIndex = 0;
  }
  
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
