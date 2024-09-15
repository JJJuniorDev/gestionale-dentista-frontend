import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './auth/register/register.component';
import { ServiziDentaliComponent } from './servizi-dentali/services/servizi-dentali.component';
import { UserSettingsComponent } from './auth/user-settings/user-settings.component';
import { UserItemComponent } from './auth/user-settings/user-item/user-item.component';
import { StatisticsComponent } from './statistics/statistics.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'operazioni',
    loadChildren: () =>
      import('./operazioni/operazioni.module').then((m) => m.OperazioniModule),
  },
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
  { path: 'servizi-dentali', component: ServiziDentaliComponent },
  { path: 'users', component: UserSettingsComponent },
  { path: 'users/:id', component: UserItemComponent },
  { path: 'statistics', component: StatisticsComponent },
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
