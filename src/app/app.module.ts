import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScrollerContainerComponent } from './components/scroller-container/scroller-container.component';
import { OnVisibleDirective } from './directives/a.directive';
import { InfiniteScrollerDirective } from './directives/infinite-scroll.directive';

@NgModule({
  declarations: [
    AppComponent,
    InfiniteScrollerDirective,
    OnVisibleDirective,
    ScrollerContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
