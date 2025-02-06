import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { PazientiComponent } from './pazienti.component';
import { ModificaPazienteComponent } from './modifica-paziente/modifica-paziente.component';
import { DettagliPazienteComponent } from './dettagli-paziente/dettagli-paziente.component';
import { ListaPazientiComponent } from './lista-operazioni/lista-pazienti.component';
import { PatientTreatmentPlansComponent } from './patient-treatment-plans/patient-treatment-plans.component';
import { StoriaMedicaComponent } from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/storia-medica.component';
import { FarmacoInUsoComponent } from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/FarmacoInUso/farmaco-in-uso/farmaco-in-uso.component';

const routes: Routes = [
  {
    path: '',
    component: PazientiComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListaPazientiComponent },
      { path: 'new', component: ModificaPazienteComponent },
      { path: ':id', component: DettagliPazienteComponent },
      { path: ':id/edit', component: ModificaPazienteComponent },

      {
        path: 'patientTreatmentPlans/:id',
        component: PatientTreatmentPlansComponent,
      },
      {
        path: 'medical-history/:id',
        component: StoriaMedicaComponent,
      },
    

      // {path: 'patientTreatmentPlans/:id', component: PatientTreatmentPlansComponent},
      // {
      //   path: 'patientAppointments/:id',
      //   component: AppuntamentiPazienteComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PazientiRoutingModule {};
