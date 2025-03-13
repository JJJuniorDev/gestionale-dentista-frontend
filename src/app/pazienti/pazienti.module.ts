import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PazientiRoutingModule } from './pazienti-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ListaPazientiComponent } from './lista-operazioni/lista-pazienti.component';
import { DettagliPazienteComponent } from './dettagli-paziente/dettagli-paziente.component';
import { PazienteItemComponent } from './lista-operazioni/paziente/paziente-item.component';
import { ModificaPazienteComponent } from './modifica-paziente/modifica-paziente.component';
import { PazientiComponent } from './pazienti.component';
import { PazienteService } from './paziente.service';
import { AppuntamentiPazienteComponent } from './appuntamenti-paziente/appuntamenti-paziente.component';
import { PatientTreatmentPlansComponent } from './patient-treatment-plans/patient-treatment-plans.component';
import { EditAppointmentModalComponent } from '../modali/edit-appointment-modal/edit-appointment-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { StoriaMedicaComponent } from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/storia-medica.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { FarmacoDialogComponent } from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/Dialogs/farmaco-dialog/farmaco-dialog.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import {
  EditorContenutoDialog,
  NotaDialogComponent,
} from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/Dialogs/nota-dialog/nota-dialog.component';
import { FarmacoInUsoComponent } from './lista-operazioni/paziente/storia-medica/pazienti/storia-medica/FarmacoInUso/farmaco-in-uso/farmaco-in-uso.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { AppuntamentoService } from '../appuntamenti/appuntamento.service';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  //mettere tutti i componenti che usiamo nel routing-module
  declarations: [
    PazientiComponent,
    ListaPazientiComponent,
    DettagliPazienteComponent,
    PazienteItemComponent,
    ModificaPazienteComponent,
    AppuntamentiPazienteComponent,
    PatientTreatmentPlansComponent,
    EditAppointmentModalComponent,
    StoriaMedicaComponent,
    FarmacoDialogComponent,
    NotaDialogComponent,
    EditorContenutoDialog,
    FarmacoInUsoComponent,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    PazientiRoutingModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    NgSelectModule,
  ],

  providers: [
    PazienteService,
    AppuntamentoService,
    {
      provide: MatDialogRef,
      useValue: {},
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: {}, // Puoi specificare un oggetto vuoto come valore predefinito
    },
  ], // Aggiungi il servizio ai provider
})
export class PazientiModule {}
