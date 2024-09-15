import { RouterModule, Routes } from '@angular/router';
import { AppuntamentiComponent } from './appuntamenti.component';
import { AuthGuard } from '../auth/auth.guard';
import { DettagliAppuntamentoComponent } from './dettagli-appuntamento/dettagli-appuntamento.component';
import { AppuntamentiModificaComponent } from './modifica-appuntamenti/appuntamenti-modifica.component';
import { NgModule } from '@angular/core';
import { ListaAppuntamentiComponent } from './lista-appuntamenti/lista-appuntamenti.component';

const routes: Routes = [
  {
    path: '',
    component: AppuntamentiComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: '', component: ListaOperazioniComponent },
      //CONTROLLA QUESTO---------------------------------------new=modifica???
      { path: 'new', component: AppuntamentiModificaComponent },
      { path: ':id', component: DettagliAppuntamentoComponent },
      { path: ':id/edit', component: AppuntamentiModificaComponent },
      { path: 'dentista/:id', component: DettagliAppuntamentoComponent },
      { path: 'upcoming', component: ListaAppuntamentiComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppuntamentiRoutingModule {}
