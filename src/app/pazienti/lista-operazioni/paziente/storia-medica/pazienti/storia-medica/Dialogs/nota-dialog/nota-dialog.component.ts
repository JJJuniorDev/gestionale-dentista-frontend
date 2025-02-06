import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StoriaMedicaService } from '../../services/storia-medica.service';


@Component({
  selector: 'app-nota-dialog',
  templateUrl: './nota-dialog.component.html',
  styleUrls: ['./nota-dialog.component.css'],
})
export class NotaDialogComponent {
  farmacoInUsoId: string;
  nota: any = {
    contenuto: '',
    tipoNota: 'medica', // Valore predefinito
    priorita: 'media', // Valore predefinito
    visibilita: true, // Valore predefinito
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Iniettare i dati passati al dialogo
    public dialogRef: MatDialogRef<NotaDialogComponent>, // Iniettare MatDialogRef per chiudere il dialogo
    private storiaMedicaService: StoriaMedicaService, // Iniettare il servizio storia medica
    private dialog: MatDialog // Iniettare il servizio MatDialog
  ) {
    console.log(
      'farmacoInUsoId IN NotaDialogComponent DIALOG: ' + data.farmacoInUsoId
    );
    this.farmacoInUsoId = data.farmacoInUsoId; // Ottieni l'ID del paziente passato nel dialogo
  }

  ngOnInit(): void {}

  confermaAggiuntaNota(): void {
    if (!this.nota.contenuto) {
      alert('Completa i campi obbligatori della nota.');
      return;
    }
    // Aggiungi l'ID del farmaco in uso alla nota
    this.nota.farmacoInUsoId = this.farmacoInUsoId;
    // Chiama il servizio per salvare la nota
    this.storiaMedicaService.aggiungiNota(this.nota).subscribe({
      next: (response) => {
        console.log('Nota aggiunta con successo:', response);
        this.dialogRef.close(true); // Chiudi il dialogo e passa il successo
      },
      error: (error) => {
        console.error("Errore durante l'aggiunta della nota:", error);
        alert("Errore durante l'aggiunta della nota.");
      },
    });
  }

  // Metodo per aprire un editor modale per il contenuto
  apriEditorContenuto(): void {
    const dialogRef = this.dialog.open(EditorContenutoDialog, {
      width: '600px',
      data: { contenuto: this.nota.contenuto },
    });
  }
}

// Componente per il dialog dell'editor
@Component({
  selector: 'app-editor-contenuto-dialog',
  template: `<h2 mat-dialog-title>Modifica Contenuto</h2>
   <mat-dialog-content>
      <textarea
        matInput
        [(ngModel)]="data.contenuto"
        rows="10"
        style="width: 100%;"
      ></textarea>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Annulla</button>
      <button mat-button color="primary" (click)="dialogRef.close(data.contenuto)">
        Salva
      </button>
    </mat-dialog-actions>
  `,
})
export class EditorContenutoDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { contenuto: string },
    public dialogRef: MatDialogRef<EditorContenutoDialog>
  ) {}
}
