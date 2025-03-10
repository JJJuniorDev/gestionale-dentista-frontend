import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, Subscription } from 'rxjs';
import { AppuntamentoService } from '../appuntamento.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { AppuntamentoDTO } from '../appuntamentoDTO.model';
import { AuthService } from 'src/app/auth/auth.service';
import { PazienteService } from 'src/app/pazienti/paziente.service';
import { EventoDTO } from '../eventoDTO.model';
import { EventoService } from '../evento.service';


@Component({
  selector: 'app-lista-appuntamenti',
  templateUrl: './lista-appuntamenti.component.html',
  styleUrls: ['./lista-appuntamenti.component.css'],
})
export class ListaAppuntamentiComponent implements OnInit, OnDestroy {
  appuntamenti: AppuntamentoDTO[] = [];
  eventi: EventoDTO[] = [];
  filteredAppuntamenti: AppuntamentoDTO[] = [];
  subscription!: Subscription;
  selectedParameter: string = 'codiceFiscalePaziente'; // Parametro di ricerca selezionato
  searchValue: string = ''; //inserito dall'utente
  searchDate!: Date | null; // Supporta il Datepicker
  @Output() viewDetails = new EventEmitter<void>();
  viewDate: Date = new Date(); // Data corrente
  calendarEvents: CalendarEvent[] = []; // Eventi del calendario

  //PER GESTIONE APPUNTAMENTI GIORNALIERI
  // ****************************
  appuntamentiGiornalieri: AppuntamentoDTO[] = []; // Appuntamenti del giorno selezionato
  eventiGiornalieri: EventoDTO[] = []; // Eventi del giorno selezionato
  selectedDay!: Date | null; // Giorno selezionato
  dottoreId!: string | null;
  showAppointmentsModal: boolean = false;

  // Navigate to previous month
  onPreviousMonth() {
    this.viewDate = new Date(
      this.viewDate.setMonth(this.viewDate.getMonth() - 1)
    );
  }

  // Navigate to next month
  onNextMonth() {
    this.viewDate = new Date(
      this.viewDate.setMonth(this.viewDate.getMonth() + 1)
    );
  }

  // Reset to today's date
  onToday() {
    this.viewDate = new Date();
  }

  constructor(
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private pazienteService: PazienteService,
    private eventoService: EventoService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId! = user.id; // Ottieni l'ID dell'utente loggato
      }
    });
    if (this.dottoreId) {
      this.subscription = this.appuntamentoService
        .getAppuntamentiPerDottore(this.dottoreId)
        .subscribe(
          (appuntamenti: AppuntamentoDTO[]) => {
            // Creiamo un array di richieste per ottenere i pazienti
            const richiestePazienti$ = appuntamenti.map((appuntamento) =>
              this.pazienteService.getPaziente(appuntamento.pazienteId).pipe(
                // Creiamo un oggetto che contiene sia l'appuntamento che il paziente
                map((paziente) => ({
                  ...appuntamento,
                  paziente: paziente, // Aggiungiamo il paziente all'appuntamento
                  dataEOrario: new Date(appuntamento.dataEOrario), // Convertiamo la data
                }))
              )
            );
            // Aspettiamo che tutte le richieste siano completate
            forkJoin(richiestePazienti$).subscribe(
              (appuntamentiCompleti) => {
                this.appuntamenti = appuntamentiCompleti; // Salviamo gli appuntamenti con i pazienti associati
                this.filteredAppuntamenti = [...this.appuntamenti]; // Filtra inizialmente tutti gli appuntamenti
                console.log(this.appuntamenti);
                this.updateCalendarEvents();
              },
              (error) => {
                console.error(
                  'Errore nel recupero degli appuntamenti con pazienti:',
                  error
                );
              }
            );
          },
          (error) => {
            console.error('Errore nel recupero degli appuntamenti:', error);
          }
        );
      // Recupera gli eventi (qui dovresti chiamare un servizio simile per gli eventi)
      this.eventoService.getEventiPerDottore(this.dottoreId).subscribe(
        (eventi: EventoDTO[]) => {
          this.eventi = eventi;
          this.updateCalendarEvents(); // Rivedi anche il codice per la gestione eventi
        },
        (error: any) => {
          console.error('Errore nel recupero degli eventi:', error);
        }
      );
    }
  }

  updateCalendarEvents() {
    const eventiPerGiorno = new Map<string, number>();
    // Conta gli appuntamenti per ogni giorno
    this.appuntamenti.forEach((appuntamento) => {
      const data = new Date(appuntamento.dataEOrario)
        .toISOString()
        .split('T')[0];
      eventiPerGiorno.set(data, (eventiPerGiorno.get(data) || 0) + 1);
    });

    // Conta gli eventi per ogni giorno
    this.eventi.forEach((evento) => {
      const data = new Date(evento.dataScade).toISOString().split('T')[0];
      eventiPerGiorno.set(data, (eventiPerGiorno.get(data) || 0) + 1);
    });

    // Crea eventi con il numero di appuntamenti
    this.calendarEvents = Array.from(eventiPerGiorno.entries()).map(
      ([date, count]) => ({
        start: new Date(date),
        title: `${count} eventi/appuntamenti`,
        color: { primary: '#007bff', secondary: '#cce5ff' },
        allDay: true, // Importante per evitare errori nella visualizzazione del numero
        meta: {
          customTitle: count.toString(), // Salva il numero come metadato (se serve per la visualizzazione)
        },
      })
    );
  }

  // Metodo chiamato quando si clicca un giorno sul calendario
  onDayClicked(event: any) {
    const date = event.day.date; // Giorno cliccato
    this.selectedDay = date;

    this.appuntamentiGiornalieri = this.appuntamenti.filter(
      (appuntamento) =>
        new Date(appuntamento.dataEOrario).toDateString() ===
        date.toDateString()
    );

    // Filtra gli eventi per il giorno selezionato
    this.eventiGiornalieri = this.eventi.filter((evento) => {
      const dataEvento = new Date(evento.dataScade);
      return dataEvento.toDateString() === date.toDateString();
    });

    if (
      this.appuntamentiGiornalieri.length > 0 ||
      this.eventiGiornalieri.length > 0
    ) {
      this.showAppointmentsModal = true;
    }
  }

  onSearch() {
    if (this.selectedParameter === 'dataEOrario' && this.searchDate) {
      const searchDateISO = this.searchDate.toISOString().split('T')[0]; // Formatta la data
      const searchDate = new Date(this.searchDate); // Crea una nuova data senza orario specificato
      searchDate.setHours(0, 0, 0, 0); // Imposta l'orario a mezzanotte per evitare problemi con l'orario
      console.log(`Ricerca per data: ${searchDateISO}`);

      // Filtra per data
      this.filteredAppuntamenti = this.appuntamenti.filter((appuntamento) => {
        const appuntamentoDate = new Date(appuntamento.dataEOrario);
        appuntamentoDate.setHours(0, 0, 0, 0); // Imposta anche l'orario degli appuntamenti a mezzanotte

        // Confronta solo la parte della data
        return appuntamentoDate.getTime() === searchDate.getTime();
      });
    } else if (this.searchValue) {
      // Filtra per gli altri parametri
      this.filteredAppuntamenti = this.appuntamenti.filter((appuntamento) => {
        const properties: { [key: string]: string } = {
          codiceFiscalePaziente: appuntamento.codiceFiscalePaziente,
          trattamento: appuntamento.trattamento,
          // Aggiungi altri parametri se necessario
        };
        if (this.selectedParameter === 'codiceFiscalePaziente') {
          return properties[this.selectedParameter].includes(this.searchValue);
        } else {
          return properties[this.selectedParameter]
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
      });
    } else {
      this.filteredAppuntamenti = this.appuntamenti; // Se il campo di ricerca è vuoto, mostra tutti gli appuntamenti
    }
  }

  onSelectAppuntamento(id: string) {
    this.viewDetails.emit(); // Emesso l'evento quando un appuntamento viene selezionato
    this.router.navigate(['/appuntamenti', id]);
  }

  onSelectEvento(id: string) {
    this.viewDetails.emit();
    this.router.navigate(['/eventi', id]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onNewAppuntamento() {
    this.router.navigate(['/appuntamenti/new'], {
      state: { appuntamenti: this.appuntamenti }, // Passa gli appuntamenti esistenti
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}



