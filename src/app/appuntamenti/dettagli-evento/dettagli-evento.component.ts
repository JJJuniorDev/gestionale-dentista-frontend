import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { EventoDTO } from '../eventoDTO.model';
import { EventoService } from '../evento.service';
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';
import { AlertService } from 'src/app/modali/alertService.service';

@Component({
  selector: 'app-dettagli-evento',
  templateUrl: './dettagli-evento.component.html',
  styleUrls: ['./dettagli-evento.component.css'],
})
export class DettagliEventoComponent implements OnInit {
  eventi: EventoDTO[] = []; // Lista degli eventi
  evento: EventoDTO | null = null; // Singolo evento
  id!: string;

  constructor(
    private eventoService: EventoService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      if (this.id) {
        console.log('Caricamento dettagli evento con ID:', this.id);
        this.eventoService.getEvento(this.id).subscribe({
          next: (evento: EventoDTO) => {
            this.evento = evento;
          },
          error: (err) => {
            console.error('Errore nel caricamento dell’evento:', err);
          },
        });
      }
    });
  }

  // Metodo per modificare l'evento
  onEventoEdit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate([`/events/edit/${id}`], { relativeTo: this.route });
    } else {
      console.error('ID evento non trovato nei parametri della rotta');
    }
  }

  // Metodo per eliminare un evento
  onDeleteEvento() {
    // Usa SweetAlert2 per chiedere la conferma
    this.alertService
      .confirmDelete(
        `Sei sicuro di voler eliminare l'appuntamento con il paziente? I dati andranno persi.`
      )
      .then((confirmed) => {
        if (confirmed) {
          const dottoreId = this.authService.getUserId();
          if (this.id) {
            this.eventoService.deleteEvento(this.id).subscribe(() => {
              this.router.navigate([`/appuntamenti/dottore/${dottoreId}`]);
            });
          }
        } else {
          console.log('Eliminazione annullata');
        }
      });
  }

  //  onChangeStato(nuovoStato: string) {
  //   if (this.evento) {
  //     this.evento.stato = nuovoStato;

  //     this.eventoService.updateEventoStato(this.id, nuovoStato).subscribe({
  //       next: () => {
  //         alert(`Stato aggiornato a "${nuovoStato}" con successo.`);
  //       },
  //       error: (err) => {
  //         console.error('Errore nell’aggiornamento dello stato:', err);
  //         alert('Errore durante l’aggiornamento dello stato.');
  //       },
  //     });
  //   }
  //}

  getBadgeClass(stato: string | undefined): string {
    if (!stato) return 'badge-secondary';

    switch (stato.toLowerCase()) {
      case 'in_attesa':
        return 'badge-primary';
      case 'in_corso':
        return 'badge-warning';
      case 'completato':
        return 'badge-success';
      case 'sospeso':
        return 'badge-info';
      case 'annullato':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }


}
