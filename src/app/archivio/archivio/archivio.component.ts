import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/auth/auth.service';
import { NotesService } from 'src/app/note/notes-list/notes.service';
import { NotaDTO } from 'src/app/pazienti/lista-operazioni/paziente/storia-medica/pazienti/storia-medica/models/notaDTO.model';

@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.css'],
})
export class ArchivioComponent implements OnInit {
  noteArchiviate = new MatTableDataSource<NotaDTO>([]);
  dottoreId: string | null = null;
  pazienteId: string | null = null; // Può essere null se il file è solo del dottore
  totalFiles: number = 0; // Totale dei file
  pageSize: number = 5; // Numero di file per pagina
  pageIndex: number = 0; // Indice della pagina corrente
  displayedColumns: string[] = [
    'tipoNota',
    'contenuto',
    'dataCreazione',
    'priorita',
  ];

   @ViewChild(MatPaginator) paginator!: MatPaginator;
   
  constructor(
    private notaService: NotesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId = user.id;
      }
    });
    console.log('DOTTORE ID :' + this.dottoreId);
    this.loadNoteArchiviate();
  }

  // 📌 Carica lista allegati
  loadNoteArchiviate() {
    this.notaService.getNotesArchiviate(this.dottoreId!).subscribe((data) => {
      this.noteArchiviate.data = data;
      this.totalFiles = this.noteArchiviate.data.length;
       this.noteArchiviate.paginator = this.paginator;
    });
  }

  // Gestisci il cambiamento di pagina
  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }


  sortByDate(event: Event) {
      const target = event.target as HTMLSelectElement; // ✅ Cast a HTMLSelectElement
      const order = target.value;
  this.noteArchiviate.data = this.noteArchiviate.data.sort((a, b) => {
    const dateA = new Date(a.dataCreazione).getTime();
    const dateB = new Date(b.dataCreazione).getTime();
    
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
}



