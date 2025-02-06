import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './auth/store/auth.effects';
//import { NgForm, ReactiveFormsModule } from '@angular/forms';
import * as fromApp from './auth/store/app.reducer';
import { AuthInterceptorService } from './auth/auth.interceptor.service';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PazientiModule } from './pazienti/pazienti.module';
import { AppuntamentiModule } from './appuntamenti/appuntamenti.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { UserSettingsComponent } from './auth/user-settings/user-settings.component';
import { AuthModule } from './auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { StatisticsComponent } from './statistics/statistics.component';
import { AppuntamentiPazienteComponent } from './pazienti/appuntamenti-paziente/appuntamenti-paziente.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './modali/confirmation-modal/confirmation-modal.component';
import { A11yModule } from '@angular/cdk/a11y';
import { ToastrModule } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
//import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import localeIt from '@angular/common/locales/it';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingInterceptor } from './spinner/loading.interceptor';

registerLocaleData(localeIt, 'it'); // Registriamo il locale italiano

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    //RegisterComponent,
    //LoginComponent,
    DashboardComponent,
    StatisticsComponent,
    ConfirmationModalComponent,
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
    AppuntamentiModule,
    BsDropdownModule.forRoot(),
    NgbModule,
    AuthModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    FormsModule,

    A11yModule,
    ToastrModule.forRoot(),
    // MatDatepickerModule,
    // MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    NgxSpinnerModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'it' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
