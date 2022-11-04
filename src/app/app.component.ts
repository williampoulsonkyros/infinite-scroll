import { Component } from '@angular/core';
import { delay, map, of, range, tap, toArray } from 'rxjs';
import { InfiniteScrollOptions } from './directives/infinite-scroll-list.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'infinite-scroll';
  lastResultIndex = 0;

  scrollerOptions: InfiniteScrollOptions = {
    autoLoadFirstPage: true,
    scrollPercent: 100,
    scrollAreaHeight: 500,
    rowHeight: 100,
    overridePageSize: 50
  }


  getNextPageCallback = (pageSize: number, page: number) => {
    console.log({ pageSize, page });  

    if (this.lastResultIndex > 150) {
      console.log(`scroll datasource EOD`)
      return of([]).pipe(delay(3000))
    }

    return range(this.lastResultIndex, pageSize)
      .pipe(
        tap(v => { console.log(`loading page starting at item ${this.lastResultIndex}`); }),
        delay(3000),
        map(i => { return ({ title: `Title - ${this.lastResultIndex++}` }); }),
        toArray(),
      )
  }


}
