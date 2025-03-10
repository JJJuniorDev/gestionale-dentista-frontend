import { RouterModule } from "@angular/router";
import { AppuntamentiComponent } from "./appuntamenti.component";
import { AppuntamentoService } from "./appuntamento.service";
import { DettagliAppuntamentoComponent } from "./dettagli-appuntamento/dettagli-appuntamento.component";
import { AppuntamentiModificaComponent } from "./modifica-appuntamenti/appuntamenti-modifica.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppuntamentiRoutingModule } from "./appuntamenti-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ListaAppuntamentiComponent } from "./lista-appuntamenti/lista-appuntamenti.component";
import { ItemAppuntamentoComponent } from "./lista-appuntamenti/appuntamento-item/appuntamento-item.component";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from "@angular/common";
import { FatturazioneComponent } from './fatturazione/fatturazione.component';
import { FatturazioneService } from "./fatturazione/fatturazione.service";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PazienteService } from "../pazienti/paziente.service";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CalendarMonthViewComponent } from 'angular-calendar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DettagliEventoComponent } from './dettagli-evento/dettagli-evento.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  //mettere tutti i componenti che usiamo nel routing-module
  declarations: [
    AppuntamentiComponent,
    ListaAppuntamentiComponent,
    DettagliAppuntamentoComponent,
    ItemAppuntamentoComponent,
    AppuntamentiModificaComponent,
    FatturazioneComponent,
    DettagliEventoComponent,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    AppuntamentiRoutingModule,
    HttpClientModule,
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CommonModule, // Usa CommonModule invece di BrowserModule
    BsDatepickerModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  providers: [
    AppuntamentoService,
    FatturazioneService,
    PazienteService,
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' }, // Formato Italiano
  ], // Aggiungi il servizio ai provider
})
export class AppuntamentiModule {}
