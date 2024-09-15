import { NgModule } from '@angular/core';
import { OperazioniComponent } from './operazioni.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OperazioniRoutingModule } from './operazioni-routing.module';
import { SharedModule } from '../shared/shared.module';
import { OperazioniModificaComponent } from './modifica-operazione/operazioni-modifica.component';
import { ListaOperazioniComponent } from './lista-operazioni/lista-operazioni.component';
import { DettagliOperazioneComponent } from './dettagli-operazione/dettagli-operazione.component';
import { ItemOperazioneComponent } from './lista-operazioni/operazione-item/operazione-item.component';
import { OperazioneService } from './operazioni.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  //mettere tutti i componenti che usiamo nel routing-module
  declarations: [
    OperazioniComponent,
    ListaOperazioniComponent,
    DettagliOperazioneComponent,
    ItemOperazioneComponent,
    OperazioniModificaComponent,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    OperazioniRoutingModule,
    SharedModule,
    HttpClientModule
  ],
 
  providers: [OperazioneService], // Aggiungi il servizio ai provider
})
export class OperazioniModule {}
