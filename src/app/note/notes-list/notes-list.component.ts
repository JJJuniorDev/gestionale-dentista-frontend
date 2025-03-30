import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NotaDTO } from 'src/app/pazienti/lista-operazioni/paziente/storia-medica/pazienti/storia-medica/models/notaDTO.model';
import { NotesService } from './notes.service';
import { MatDialog } from '@angular/material/dialog';
import { AddNoteDialogComponent } from '../modali/add-note-dialog/add-note-dialog.component';
import { Paziente } from 'src/app/pazienti/paziente.model';
import { SelectPatientDialogComponent } from '../modali/select-patient-dialog/select-patient-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent implements OnInit {
  notes: NotaDTO[] = [];
  filteredNotes: NotaDTO[] = [];
  unassignedNotes: NotaDTO[] = [];
  assignedNotes: NotaDTO[] = [];
  filterPriority: string = '';

  paginatedUnassignedNotes: NotaDTO[] = [];
  unassignedCurrentPage: number = 0;
  unassignedPageSize: number = 3;

  // Paginazione per Note del Paziente Selezionato
  paginatedPatientNotes: NotaDTO[] = [];
  patientNotes: NotaDTO[] = [];
  patientCurrentPage: number = 0;
  patientPageSize: number = 3;

  selectedPatient: Paziente | null = null;

  isModalOpen = false;
  selectedNote: NotaDTO | null = null;
  dottoreId: string | undefined;
  constructor(private notesService: NotesService, public dialog: MatDialog,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
   this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId! = user.id; 
      }
  });
    this.loadNotes();
  }

  loadNotes(): void {
    this.notesService.getNotes(this.dottoreId!).subscribe((data) => {
      this.notes = data;
      this.filterNotes(this.filterPriority);
      this.updatePaginatedUnassignedNotes();
    });
  }

  updatePaginatedUnassignedNotes(): void {
    const start = this.unassignedCurrentPage * this.unassignedPageSize;
    const end = start + this.unassignedPageSize;
    this.paginatedUnassignedNotes = this.unassignedNotes.slice(start, end);
  }

  updatePaginatedPatientNotes(): void {
    const start = this.patientCurrentPage * this.patientPageSize;
    const end = start + this.patientPageSize;
    this.paginatedPatientNotes = this.patientNotes.slice(start, end);
  }

  onUnassignedPageChange(event: PageEvent): void {
    this.unassignedCurrentPage = event.pageIndex;
    this.unassignedPageSize = event.pageSize;
    this.updatePaginatedUnassignedNotes();
  }

  onPatientPageChange(event: PageEvent): void {
    this.patientCurrentPage = event.pageIndex;
    this.patientPageSize = event.pageSize;
    this.updatePaginatedPatientNotes();
  }

  addNote(newNote: NotaDTO): void {
    this.notesService.addNote(newNote).subscribe(() => {
      this.loadNotes();
    });
  }

  filterNotes(priority: string): void {
    this.filterPriority = priority;
    this.filteredNotes = priority
      ? this.notes.filter((note) => note.priorita === priority)
      : this.notes;

    // Separiamo le note tra assegnate e non assegnate
    this.unassignedNotes = this.filteredNotes.filter(
      (n) => !n.pazienteId && !n.appuntamentoId
    );
    this.assignedNotes = this.filteredNotes.filter(
      (n) => n.pazienteId || n.appuntamentoId
    );
    this.updatePaginatedUnassignedNotes();
  }

  assignNote(note: NotaDTO): void {
    const dialogRef = this.dialog.open(SelectPatientDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((selectedPatient: Paziente) => {
      if (selectedPatient) {
        note.pazienteId = selectedPatient.id;
        // Aggiorna l'ID del paziente sulla nota
        const updatedNote: NotaDTO = {
          ...note,
          pazienteId: selectedPatient.id, // Assicurati che venga aggiornato correttamente
        };

        console.log(
          `Nota assegnata a: ${selectedPatient.nome} (ID: ${selectedPatient.id})`
        );

        this.notesService.updateNote(note).subscribe(() => {
          this.loadNotes();
        });
      }
    });
  }
  openAddNoteDialog(): void {
    const dialogRef = this.dialog.open(AddNoteDialogComponent, {
      width: '600px',
      data: { dottoreId: this.dottoreId },
    });

    dialogRef.afterClosed().subscribe((result) => {
       if (result) {
         this.loadNotes(); // Aggiorna la lista dopo il salvataggio
       }
    });
  }

  openPatientSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectPatientDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((patient: Paziente) => {
      if (patient) {
        this.selectedPatient = patient;
        this.loadNotesForPatient(patient.id);
      }
    });
  }

  clearPatientSelection(): void {
    this.selectedPatient = null;
    this.patientNotes = [];
    this.paginatedPatientNotes = [];
  }

  loadNotesForPatient(pazienteId: string): void {
    this.notesService.getNotesByPatient(pazienteId).subscribe((data) => {
      this.patientNotes = data;
      this.updatePaginatedPatientNotes();
    });
  }

  // Metodo per aprire la finestra modale con il contenuto completo
  openModal(note: NotaDTO) {
    this.selectedNote = note;
    this.isModalOpen = true;
  }

  // Metodo per chiudere la finestra modale
  closeModal() {
    this.isModalOpen = false;
    this.selectedNote = null;
  }

  archiviaNota(id: string): void {
    console.log("ID NOTA: "+id);
    this.notesService.archiviaNota(id).subscribe({
      next: () => {
     this.toastr.success('Nota archiviata con successo!', 'Successo', {
       timeOut: 3000, // Mostra il messaggio per 3 secondi
       positionClass: 'toast-top-center', // Posizione: al centro dello schermo
       progressBar: true, // Aggiunge una barra di progresso
       closeButton: true, // Aggiungi il pulsante di chiusura
     });
        this.loadNotes(); // Ricarica le note per aggiornare la lista
      },
      error: (err) => {
        console.error(err);
      this.toastr.error("Errore durante l'archiviazione della nota", 'Errore', {
        timeOut: 3000, // Mostra il messaggio per 3 secondi
        positionClass: 'toast-top-center', // Posizione: al centro dello schermo
        progressBar: true, // Aggiunge una barra di progresso
        closeButton: true, // Aggiungi il pulsante di chiusura
      });
      },
    });
  }
}
