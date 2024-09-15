import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  PazientiRoutingModule,
} from './pazienti-routing.module';
import { SharedModule } from '../shared/shared.module';

import { HttpClientModule } from '@angular/common/http';
import { ListaPazientiComponent } from './lista-operazioni/lista-pazienti.component';
import { DettagliPazienteComponent } from './dettagli-paziente/dettagli-paziente.component';
import { PazienteItemComponent } from './lista-operazioni/paziente/paziente-item.component';
import { ModificaPazienteComponent } from './modifica-paziente/modifica-paziente.component';
import { PazientiComponent } from './pazienti.component';
import { PazienteService } from './paziente.service';

@NgModule({
  //mettere tutti i componenti che usiamo nel routing-module
  declarations: [
    PazientiComponent,
    ListaPazientiComponent,
    DettagliPazienteComponent,
    PazienteItemComponent,
    ModificaPazienteComponent,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    PazientiRoutingModule,
    SharedModule,
    HttpClientModule,
  ],

  providers: [PazienteService], // Aggiungi il servizio ai provider
})
export class PazientiModule {}
