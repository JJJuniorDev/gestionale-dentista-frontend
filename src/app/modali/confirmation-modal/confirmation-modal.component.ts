import { AfterViewInit, Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmationModalComponent implements AfterViewInit {
  @ViewChild('confirmButton') confirmButton!: ElementRef;
  isEditable: boolean = false; // Indica se il contenuto è modificabile
  textareaContent: string; // Per salvare l'anamnesi (o altri contenuti dinamici)

  constructor(
    public dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.textareaContent = data.content || ''; // Carica il contenuto dinamico
    this.isEditable = data.isEditable || false; // Determina se è modificabile
  }

  ngAfterViewInit(): void {
   if (this.confirmButton) {
    this.confirmButton.nativeElement.focus();
  }
}

  onConfirm(): void {
    this.dialogRef.close(true); // Restituisce "true" per confermare l'azione
  }

  onCancel(): void {
    this.dialogRef.close(false); // Restituisce "false" per annullare
  }

  onSave(): void {
    this.dialogRef.close(this.textareaContent); // Restituisce il contenuto modificato
  }
}