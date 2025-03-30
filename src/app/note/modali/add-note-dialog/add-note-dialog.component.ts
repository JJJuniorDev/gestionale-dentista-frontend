import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotesService } from '../../notes-list/notes.service';

@Component({
  selector: 'app-add-note-dialog',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.css'],
})
export class AddNoteDialogComponent {
  noteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddNoteDialogComponent>,
    private notesService: NotesService,
    @Inject(MAT_DIALOG_DATA) public data: { dottoreId: string }
  ) {
    this.noteForm = this.fb.group({
      contenuto: ['', [Validators.required, Validators.minLength(5)]],
      tipoNota: ['', Validators.required],
      priorita: ['media', Validators.required], // Valore predefinito "media"
    });
  }

  onSubmit(): void {
    if (this.noteForm.valid) {
      const payload = {
        ...this.noteForm.value,
        dottoreId: this.data.dottoreId,
      };
      console.log('JSON inviato:', JSON.stringify(payload)); // <-- Debug
      this.notesService.addNote(payload).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          console.error('Errore durante il salvataggio della nota:', error);
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
