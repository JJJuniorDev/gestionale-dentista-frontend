import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { PazientiComponent } from './pazienti.component';
import { ModificaPazienteComponent } from './modifica-paziente/modifica-paziente.component';
import { DettagliPazienteComponent } from './dettagli-paziente/dettagli-paziente.component';

const routes: Routes = [
  {
    path: '',
    component: PazientiComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: '', component: ListaOperazioniComponent },
      { path: 'new', component: ModificaPazienteComponent },
      { path: ':id', component: DettagliPazienteComponent },
      { path: ':id/edit', component: ModificaPazienteComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PazientiRoutingModule {};
