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
import { isSameDay } from 'date-fns';
import { ToastrService } from 'ngx-toastr';

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
  weeklyCalendarEvents: CalendarEvent[] = [];
  //PER GESTIONE APPUNTAMENTI GIORNALIERI
  // ****************************
  appuntamentiGiornalieri: AppuntamentoDTO[] = []; // Appuntamenti del giorno selezionato
  eventiGiornalieri: EventoDTO[] = []; // Eventi del giorno selezionato
  selectedDay!: Date | null; // Giorno selezionato
  dottoreId!: string | null;
  showAppointmentsModal: boolean = false;

  viewMode: 'month' | 'week' = 'month'; // Di default parte in modalità "month"
  hours: number[] = Array.from({ length: 24 }, (_, i) => i).filter(
    (hour) => !((hour >= 0 && hour < 7) || (hour >= 22 && hour < 23))
  );
  isSameDay = isSameDay;
  toggleViewMode(mode: 'month' | 'week') {
    this.viewMode = mode;
  }

  formatDateWithTimeZone(date: Date, format: string): string {
    // Aggiungi 2 ore
    const dateWithOffset = new Date(date.getTime() + 2 * 60 * 60 * 1000); // Aggiunge 2 ore (in millisecondi)

    return dateWithOffset.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // aggiungiDueOre(data: any): string {
  //   const dataObj = new Date(data); // Converte stringa in Date
  //   const nuovaData = new Date(dataObj.getTime() + 2 * 60 * 60 * 1000);
  //   return nuovaData.toLocaleTimeString('it-IT', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false,
  //   });
  // }

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
    private eventoService: EventoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId = user.id;

        this.subscription = this.appuntamentoService
          .getAppuntamentiPerDottore(this.dottoreId)
          .subscribe(
            (appuntamenti: AppuntamentoDTO[]) => {
              const richiestePazienti$ = appuntamenti.map((appuntamento) =>
                this.pazienteService.getPaziente(appuntamento.pazienteId).pipe(
                  map((paziente) => {
                    const dataEOrario =
                      appuntamento.dataEOrario instanceof Date
                        ? appuntamento.dataEOrario
                        : this.parseLocalDateTime(appuntamento.dataEOrario);

                    return {
                      ...appuntamento,
                      paziente,
                      dataEOrario,
                    };
                  })
                )
              );

              forkJoin(richiestePazienti$).subscribe(
                (appuntamentiCompleti) => {
                  this.appuntamenti = appuntamentiCompleti;
                  this.filteredAppuntamenti = [...this.appuntamenti];
                  this.updateCalendarEvents();
                  this.updateWeeklyCalendarEvents();
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

        this.eventoService.getEventiPerDottore(this.dottoreId).subscribe(
          (eventi: EventoDTO[]) => {
            console.log('Eventi ricevuti:', eventi);
            this.eventi = eventi;
            this.updateCalendarEvents();
            this.updateWeeklyCalendarEvents();
          },
          (error: any) => {
            console.error('Errore nel recupero degli eventi:', error);
          }
        );
      }
    });
  }

  parseLocalDateTime(dateTimeString: string): Date {
    return new Date(dateTimeString); // JavaScript fa il parsing e converte in ora locale
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
      const data = new Date(evento.dataEOrario).toISOString().split('T')[0];
      eventiPerGiorno.set(data, (eventiPerGiorno.get(data) || 0) + 1);
    });

    // Crea eventi con il numero di appuntamenti
    this.calendarEvents = Array.from(eventiPerGiorno.entries()).map(
      ([date, totale]) => ({
        start: new Date(date),
        title: `${totale}`,
        color: { primary: '#007bff', secondary: '#cce5ff' },
        allDay: true, // Importante per evitare errori nella visualizzazione del numero
      })
    );
  }
  // Modifica il metodo updateWeeklyCalendarEvents per normalizzare le date
  updateWeeklyCalendarEvents() {
    this.weeklyCalendarEvents = [
      ...this.appuntamenti.map((appuntamento) => {
        // Normalizza la data rimuovendo l'offset del fuso orario
        const start = new Date(appuntamento.dataEOrario);
        start.setMinutes(start.getMinutes() - start.getTimezoneOffset());

        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          title: `🧑‍⚕️ ${appuntamento.paziente?.nome} ${appuntamento.paziente?.cognome}`,
          start,
          end,
          color: { primary: '#007bff', secondary: '#cce5ff' },
          meta: { type: 'appuntamento', id: appuntamento.id },
        };
      }),
      ...this.eventi.map((evento) => {
        const start = new Date(evento.dataEOrario);
        start.setMinutes(start.getMinutes() - start.getTimezoneOffset());

        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return {
          title: `🗓️ ${evento.tipologia}`,
          start,
          end,
          color: { primary: '#28a745', secondary: '#d4edda' },
          meta: { type: 'evento', id: evento.id },
        };
      }),
    ];
    console.log('EVENTI NORMALIZZATI', this.weeklyCalendarEvents);
  }

  // Metodo chiamato quando si clicca un giorno sul calendario
  //onDayClicked(event: { day: { date: Date; badgeTotal: number } }) {
  onDayClicked(event: any) {
    if (!event || !event.day) return;

    const date = event.day.date;
    this.selectedDay = date;

    this.appuntamentiGiornalieri = this.appuntamenti.filter(
      (appuntamento) =>
        new Date(appuntamento.dataEOrario).toDateString() ===
        date.toDateString()
    );

    this.eventiGiornalieri = this.eventi.filter((evento) => {
      const dataEvento = new Date(evento.dataEOrario);
      return dataEvento.toDateString() === date.toDateString();
    });

    this.showAppointmentsModal = true;
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
      // state: { appuntamenti: this.appuntamenti }, // Passa gli appuntamenti esistenti
    });
  }

  onNewEvento() {
    this.router.navigate(['/events/new'], {
      // state: { eventi: this.eventi }, // Passa gli appuntamenti esistenti
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

  segnaComeEseguito(appuntamento: AppuntamentoDTO) {
    const updated = { ...appuntamento, stato: 'eseguito' };

    this.appuntamentoService
      .updateAppuntamento(appuntamento.id, updated)
      .subscribe({
        next: () => {
          appuntamento.stato = 'eseguito'; // Aggiorna localmente
        },
        error: () => {
          this.toastr.error(
            "Errore nel salvare lo stato dell'appuntamento",
            'Errore'
          );
        },
      });
  }

  onEventClicked(event: CalendarEvent): void {
    if (event.meta?.type === 'appuntamento') {
      this.onSelectAppuntamento(event.meta.id);
    } else if (event.meta?.type === 'evento') {
      this.onSelectEvento(event.meta.id);
    }
  }
}



