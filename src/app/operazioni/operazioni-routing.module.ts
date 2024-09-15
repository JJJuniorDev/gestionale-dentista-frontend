import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { OperazioniComponent } from './operazioni.component';
import { OperazioniModificaComponent } from './modifica-operazione/operazioni-modifica.component';
import { DettagliOperazioneComponent } from './dettagli-operazione/dettagli-operazione.component';
import { ListaOperazioniComponent } from './lista-operazioni/lista-operazioni.component';

const routes: Routes = [
  {
    path: '',
    component: OperazioniComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: '', component: ListaOperazioniComponent },
      { path: 'new', component: OperazioniModificaComponent },
      { path: ':id', component: DettagliOperazioneComponent },
      { path: ':id/edit', component: OperazioniModificaComponent },
    ],
  },
];

    @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule],
    })
    export class OperazioniRoutingModule {};
