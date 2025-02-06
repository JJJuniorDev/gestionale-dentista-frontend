import { Component, Inject, EventEmitter, Output, Optional, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AppuntamentoService } from 'src/app/appuntamenti/appuntamento.service';
import { PazienteService } from 'src/app/pazienti/paziente.service';

@Component({
  selector: 'app-edit-appointment-modal',
  templateUrl: './edit-appointment-modal.component.html',
  styleUrls: ['./edit-appointment-modal.component.css'],
})
export class EditAppointmentModalComponent {
  @Output() updatedAppointmentEvent = new EventEmitter<any>(); // Per inviare l'oggetto della tappa aggiornata al componente principale
  updatedAppointment = {
    id: '',
    dataEOrario: new Date(),
    trattamento: '',
    stato: '',
    note: '',
    paziente: null,
    codiceFiscalePaziente: '', // Add these missing fields
    pazienteId: '',
  };
  currentPlanId = ''; // Per tenere traccia dell'ID del piano attuale

  constructor(
    private toastr: ToastrService,
    private appointmentService: AppuntamentoService,
    @Optional() public dialogRef: MatDialogRef<EditAppointmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: any; planId: string }
  ) {
    // Inizializza i dati della tappa e del piano
    this.updatedAppointment = { ...data.appointment };
    this.currentPlanId = data.planId;
  }

  // Metodo per inviare i dati aggiornati al componente principale
  submitUpdatedAppointment(): void {
    if (this.currentPlanId && this.updatedAppointment.id) {
      this.appointmentService
        .updateAppuntamento(this.updatedAppointment.id, this.updatedAppointment)
        .subscribe(
          (updatedAppointment: any) => {
            this.toastr.success(
              'updatedAppointment aggiornata con successo!',
              'Successo'
            );
            this.dialogRef.close(updatedAppointment); // Chiude il dialog passando i dati aggiornati
          },
          (error) => {
            console.error(
              "Errore durante l'aggiornamento della updatedAppointment:",
              error
            );
            this.toastr.error(
              "Errore durante l'aggiornamento della updatedAppointment",
              'Errore'
            );
          }
        );
    }
  }

  // Metodo per chiudere il dialog senza salvare
  closeDialog(): void {
    this.dialogRef.close();
  }
}
