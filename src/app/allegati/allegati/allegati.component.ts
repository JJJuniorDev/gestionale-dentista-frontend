import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AllegatiService } from '../allegati.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Allegato } from '../allegato.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-allegati',
  templateUrl: './allegati.component.html',
  styleUrls: ['./allegati.component.css'],
})
export class AllegatiComponent implements OnInit {
  allegati: Allegato[] = [];
  fileToUpload: File | null = null;
  previewUrl: SafeUrl | null = null;
  dottoreId: string | null = null;
  pazienteId: string | null = null; // Può essere null se il file è solo del dottore
  totalFiles: number = 0; // Totale dei file
  pageSize: number = 3; // Numero di file per pagina
  pageIndex: number = 0; // Indice della pagina corrente
  isUploading = false;
  searchText: string = '';

  constructor(
    private allegatiService: AllegatiService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId = user.id;
      }
    });
    console.log('DOTTORE ID :' + this.dottoreId);
    this.loadAllegati();
  }

  // 📌 Carica lista allegati
  loadAllegati() {
    this.allegatiService
      .getAllegatiPerDottore(this.dottoreId!)
      .subscribe((data) => {
        this.allegati = data;
        this.totalFiles = this.allegati.length;
      });
  }

  // 📌 Seleziona file da caricare
  onFileSelected(event: any) {
    this.fileToUpload = event.target.files[0];
    // Verifica la dimensione e il tipo di file
    if (this.fileToUpload) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
      ];

      if (this.fileToUpload.size > maxSize) {
        alert('Il file è troppo grande. La dimensione massima è 10MB.');
        this.fileToUpload = null;
        return;
      }

      if (!allowedTypes.includes(this.fileToUpload.type)) {
        alert(
          'Tipo di file non supportato. Puoi caricare solo immagini o documenti.'
        );
        this.fileToUpload = null;
        return;
      }

      // Mostra un'anteprima solo se è un'immagine
      if (this.fileToUpload && this.fileToUpload.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
          );
        };
        reader.readAsDataURL(this.fileToUpload);
      }
    }
  }

  // 📌 Carica file
  uploadFile() {
    if (this.fileToUpload) {
      this.isUploading = true; // Indica che il caricamento è iniziato
      this.allegatiService
        .uploadAllegato(this.fileToUpload, this.pazienteId!, this.dottoreId!)
        .subscribe(
          () => {
            this.loadAllegati();
            this.fileToUpload = null;
            this.previewUrl = null;
            this.isUploading = false; // Fine caricamento
          },
          (error) => {
            this.isUploading = false; // Fine caricamento in caso di errore
            alert('Errore durante il caricamento del file!');
          }
        );
    }
  }

  // 📌 Scarica file
  downloadFile(fileId: string, fileName: string) {
    this.allegatiService.downloadAllegato(fileId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  // 📌 Elimina file
  deleteFile(fileId: string) {
    this.allegatiService.deleteAllegato(fileId).subscribe(() => {
      this.loadAllegati();
    });
  }

  viewFile(fileId: string, fileType: string) {
     this.allegatiService.downloadAllegato(fileId).subscribe((blob) => {
    console.log('📂 Tipo MIME ricevuto:', blob.type);
    console.log('📏 Dimensione del file:', blob.size, 'bytes');

    if (blob.size === 0) {
      alert('Errore: Il file è vuoto o corrotto.');
      return;
    }

       const blobUrl = window.URL.createObjectURL(blob);

       // Se il file è un'immagine o un PDF, mostra un'anteprima
    if (fileType.startsWith('image/')) {
      // Per le immagini: apri direttamente l'immagine in una nuova finestra
      window.open(blobUrl, '_blank');
    } else if (fileType === 'application/pdf') {
      // Per i PDF: apri direttamente il PDF in una nuova finestra
      window.open(blobUrl, '_blank');
    } else {
      // Altri tipi di file non supportati per visualizzazione diretta
      alert('Impossibile visualizzare questo tipo di file direttamente nel browser. Verrà avviato il download.');
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'file_non_immagine.' + fileType.split('/')[1]; // Nome del file per il download
      link.click();
    }
  });
}
  

  // Funzione che restituisce gli allegati filtrati
  get filteredAllegati() {
    return this.allegati.filter((allegato) =>
      allegato.nomeFile.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Gestisci il cambiamento di pagina
  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
