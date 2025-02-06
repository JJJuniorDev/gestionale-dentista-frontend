import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserSettingsComponent } from './auth/user-settings/user-settings.component';
import { UserItemComponent } from './auth/user-settings/user-item/user-item.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ListaAppuntamentiComponent } from './appuntamenti/lista-appuntamenti/lista-appuntamenti.component';
import { AppuntamentiPazienteComponent } from './pazienti/appuntamenti-paziente/appuntamenti-paziente.component';
import { PatientTreatmentPlansComponent } from './pazienti/patient-treatment-plans/patient-treatment-plans.component';
import { FarmacoInUsoComponent } from './pazienti/lista-operazioni/paziente/storia-medica/pazienti/storia-medica/FarmacoInUso/farmaco-in-uso/farmaco-in-uso.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'pazienti',
    loadChildren: () =>
      import('./pazienti/pazienti.module').then((m) => m.PazientiModule),
  },
  {
    path: 'appuntamenti',
    loadChildren: () =>
      import('./appuntamenti/appuntamenti.module').then(
        (m) => m.AppuntamentiModule
      ),
  },
  { path: 'users', component: UserSettingsComponent },
  { path: 'users/:id', component: UserItemComponent },
  { path: 'statistics', component: StatisticsComponent },
  {
    path: 'patientAppointments/:id',
    component: AppuntamentiPazienteComponent,
  },
  { path: 'appuntamenti/upcoming', component: ListaAppuntamentiComponent },
  {
    path: 'farmaci/:farmacoId',
    component: FarmacoInUsoComponent,
  },
  {
    path: '**',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  //{  path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
