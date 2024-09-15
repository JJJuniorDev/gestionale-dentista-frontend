import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './auth/store/auth.effects';
import { NgForm, ReactiveFormsModule } from '@angular/forms';
import * as fromApp from './auth/store/app.reducer';
import { AuthInterceptorService } from './auth/auth.interceptor.service';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OperazioniModule } from './operazioni/operazioni.module';
import { PazientiModule } from './pazienti/pazienti.module';
import { AppuntamentiModule } from './appuntamenti/appuntamenti.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiziDentaliComponent } from './servizi-dentali/services/servizi-dentali.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserSettingsComponent } from './auth/user-settings/user-settings.component';
import { AuthModule } from './auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { StatisticsComponent } from './statistics/statistics.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    //RegisterComponent,
    //LoginComponent,
    DashboardComponent,
    ServiziDentaliComponent,
    StatisticsComponent
  ],
  imports: [
    NgChartsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot(fromApp.appReducer),
    EffectsModule.forRoot([AuthEffects]),
    SharedModule,
    CoreModule,
    OperazioniModule,
    PazientiModule,
    AppuntamentiModule,
    BsDropdownModule.forRoot(),
    NgbModule,
    AuthModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptorService,
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
