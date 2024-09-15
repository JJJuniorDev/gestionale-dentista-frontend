import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
// bootstrapApplication(AppComponent, {
//   providers: [provideStore({counter: counterReducer})]
// })