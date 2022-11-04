import { Component } from '@angular/core';
import { delay, map, of, range, tap, toArray } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'infinite-scroll';
  lastResultIndex = 0;
  data = []
  xg = 20;

  scrollCallback = (pageSize: number, page: number) => {
    console.log({ pageSize, page });

    if (this.lastResultIndex > 150) {
      console.log(`scroll datasource EOD`)
      return of([]).pipe(delay(2000))
    }
    
    return range(this.lastResultIndex, pageSize)
      .pipe(
        tap(v => { console.log(`loading page starting at item ${this.lastResultIndex}`); }),
        delay(2000),
        map(i => { return ({ title: `Title - ${this.lastResultIndex++}` }); }),
        toArray(),
        tap(v => { this.data.push(...v); })
      )
  }


}
