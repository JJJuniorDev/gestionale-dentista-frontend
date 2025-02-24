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

    // Mostra un'anteprima se è un'immagine
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

  // 📌 Carica file
  uploadFile() {
    if (this.fileToUpload) {
      console.log(
        'FILE: ' + this.fileToUpload + 'DOTTORE ID: ' + this.dottoreId,
        'PAZIENTE ID: ' + this.pazienteId
      );
      this.allegatiService
        .uploadAllegato(this.fileToUpload, this.pazienteId!, this.dottoreId!)
        .subscribe(() => {
          this.loadAllegati();
          this.fileToUpload = null;
          this.previewUrl = null;
        });
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

      if (fileType.startsWith('image/') || fileType === 'application/pdf') {
        window.open(blobUrl, '_blank');
      } else {
        alert(
          'Impossibile visualizzare questo tipo di file direttamente nel browser.'
        );
      }
    });
  }

  // Gestisci il cambiamento di pagina
  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
