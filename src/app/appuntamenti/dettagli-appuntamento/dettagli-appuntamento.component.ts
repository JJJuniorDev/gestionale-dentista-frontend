import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppuntamentoService } from '../appuntamento.service';
import { AppuntamentoDTO } from '../appuntamentoDTO.model';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-dettagli-appuntamento',
  templateUrl: './dettagli-appuntamento.component.html',
  styleUrls: ['./dettagli-appuntamento.component.css'],
})
export class DettagliAppuntamentoComponent implements OnInit {
  appuntamenti: AppuntamentoDTO[] = []; // Lista degli appuntamenti (se disponibile)
  appuntamento: AppuntamentoDTO | null = null; // Singolo appuntamento (se disponibile)
  id!: string;

  constructor(
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      if (this.id) {
        console.log(
          'STIAMO CERCANDO DI PRENDERE DETTAGLIO APPUNTAMENTO CON GETAPPUNTAMENTO'
        );
        this.appuntamentoService.getAppuntamento(this.id).subscribe({
          next: (appuntamento: AppuntamentoDTO) => {
            this.appuntamento = appuntamento; // Ora assegniamo l'appuntamento correttamente
          },
          error: (err) => {
            console.error("Errore nel caricamento dell'appuntamento:", err);
          },
        });
      }
    });
  }
  //}

  // Metodo per la modifica dell'appuntamento
  onAppuntamentoEdit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router
        .navigate([`/appuntamenti/${id}/edit`], { relativeTo: this.route })
        .then((success) =>
          console.log(
            `Navigazione a /appuntamenti/${id}/edit riuscita`,
            success
          )
        )
        .catch((error) => console.error('Errore nella navigazione:', error));
    } else {
      console.error('ID non trovato nei parametri della rotta');
    }
  }

  // Metodo per la cancellazione dell'appuntamento
  onDeleteAppuntamento() {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      panelClass: 'custom-confirmation-modal', // Classe personalizzata
      data: {
        cf: this.appuntamento?.codiceFiscalePaziente,
        data: this.appuntamento?.dataEOrario,
      }, // Passa i dati al modale
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dottoreId = this.authService.getUserId();
        if (this.id) {
          this.appuntamentoService.deleteAppuntamento(this.id).subscribe(() => {
            this.router.navigate([`/appuntamenti/dottore/${dottoreId}`]);
          });
        }
      } else {
        console.log('Eliminazione annullata');
      }
    });
  }

  onChangeStato(nuovoStato: string) {
    if (this.appuntamento) {
      // Aggiorna lo stato localmente
      this.appuntamento.stato = nuovoStato;

      // Salva lo stato aggiornato nel backend
      this.appuntamentoService
        .updateAppuntamentoStato(this.id, nuovoStato)
        .subscribe({
          next: () => {
            alert(`Stato aggiornato a "${nuovoStato}" con successo.`);
          },
          error: (err) => {
            console.error("Errore nell'aggiornamento dello stato:", err);
            alert("Errore durante l'aggiornamento dello stato.");
          },
        });
    }
  }

  getBadgeClass(stato: string | undefined): string {
    if (!stato) return 'badge-secondary'; // Classe di default se lo stato è undefined

    switch (stato.toLowerCase()) {
      case 'futuro':
        return 'badge-primary';
      case 'in_esecuzione':
        return 'badge-warning';
      case 'eseguito':
        return 'badge-success';
      case 'sospeso':
        return 'badge-info';
      case 'annullato':
        return 'badge-danger';
      default:
        return 'badge-secondary'; // Classe di fallback
    }
  }
}
