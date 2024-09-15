import { RouterModule } from "@angular/router";
import { AppuntamentiComponent } from "./appuntamenti.component";
import { AppuntamentoService } from "./appuntamento.service";
import { DettagliAppuntamentoComponent } from "./dettagli-appuntamento/dettagli-appuntamento.component";
import { AppuntamentiModificaComponent } from "./modifica-appuntamenti/appuntamenti-modifica.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppuntamentiRoutingModule } from "./appuntamenti-routing.module";
import { SharedModule } from "../shared/shared.module";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ListaAppuntamentiComponent } from "./lista-appuntamenti/lista-appuntamenti.component";
import { ItemAppuntamentoComponent } from "./lista-appuntamenti/appuntamento-item/appuntamento-item.component";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from "@angular/common";
@NgModule({
  //mettere tutti i componenti che usiamo nel routing-module
  declarations: [
    AppuntamentiComponent,
    ListaAppuntamentiComponent,
    DettagliAppuntamentoComponent,
    ItemAppuntamentoComponent,
    AppuntamentiModificaComponent,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    AppuntamentiRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CommonModule, // Usa CommonModule invece di BrowserModule
    BsDatepickerModule.forRoot(),
  ],

  providers: [AppuntamentoService], // Aggiungi il servizio ai provider
})
export class AppuntamentiModule {}
