import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Appuntamento } from '../appuntamento.model';
import { AppuntamentoService } from '../appuntamento.service';
import { CalendarEvent } from 'angular-calendar';


@Component({
  selector: 'app-lista-appuntamenti',
  templateUrl: './lista-appuntamenti.component.html',
  styleUrls: ['./lista-appuntamenti.component.css'],
})
export class ListaAppuntamentiComponent implements OnInit, OnDestroy {
  appuntamenti: Appuntamento[] = [];
  filteredAppuntamenti: Appuntamento[] = [];
  subscription!: Subscription;
  selectedParameter: string = 'codiceFiscalePaziente'; // Parametro di ricerca selezionato
  searchValue: string = ''; //inserito dall'utente
  searchDate!: string;
  @Output() viewDetails = new EventEmitter<void>();
  viewDate: Date = new Date(); // Data corrente
  calendarEvents: CalendarEvent[] = []; // Eventi del calendario
  showCalendar: boolean = true; // Variabile per controllare la visualizzazione
  paginatedAppuntamenti: Appuntamento[] = []; // Array per gli appuntamenti paginati
  itemsPerPage: number = 5; // Numero di elementi per pagina
  currentPage: number = 1; // Pagina corrente
  isUpcomingView: boolean = false; //vista per gli appuntamenti futuri

  constructor(
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Controlla se sei nella rotta /upcoming
    this.isUpcomingView = this.route.snapshot.url.some(
      (segment) => segment.path === 'upcoming');
console.log("UPCOMINg"+this.isUpcomingView);
    this.subscription = this.appuntamentoService.appuntamentiChanged.subscribe(
      (appuntamenti: Appuntamento[]) => {
        //se abbiamo cambiato qualcosa riceviamo il nuovo array
        this.appuntamenti = appuntamenti; //assegno le nostre operazioni alle nuove ricevute
          // Se siamo nella rotta "upcoming", filtra gli appuntamenti futuri
      if (this.isUpcomingView){
    this.filteredAppuntamenti = appuntamenti.filter(
      (a) => new Date(a.dataEOrario) > new Date()
    );
  } else {
          this.filteredAppuntamenti = this.appuntamenti; // Mostra tutti gli appuntamenti in caso contrario
        }

this.updatePaginatedResults();
this.updateCalendarEvents();
      }
    );
    // Sottoscrizione al metodo getOperazioni
    this.appuntamentoService
      .getAppuntamenti()
      .subscribe((appuntamenti: Appuntamento[]) => {
        this.appuntamenti = appuntamenti;
        this.filteredAppuntamenti = appuntamenti;
        this.updateCalendarEvents();
      });
  }

  updateCalendarEvents() {
    this.calendarEvents = this.appuntamenti.map((appuntamento) => ({
      start: new Date(appuntamento.dataEOrario),
      title: `Appuntamento con ${appuntamento.codiceFiscalePaziente}`,
      color: {
        primary: '#ad2121',
        secondary: '#FAE3E3',
      },
    }));
  }

  onDayClicked(event: any) {
    const date = event.day.date;
    const appuntamentiInData = this.appuntamenti.filter(
      (appuntamento) =>
        new Date(appuntamento.dataEOrario).toDateString() ===
        date.toDateString()
    );

    if (appuntamentiInData.length > 0) {
      alert(
        'Non è possibile prenotare un appuntamento in questa data poiché è già occupata.'
      );
    } else {
      this.router.navigate(['new'], {
        relativeTo: this.route,
        queryParams: { date: date.toISOString() },
      });
    }
  }

  //quando clicco
  onToggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onSearch() {
    if (this.selectedParameter === 'dataEOrario' && this.searchDate) {
      // Filtra per data
      this.filteredAppuntamenti = this.appuntamenti.filter(
        (appuntamento) =>
          new Date(appuntamento.dataEOrario).toDateString() ===
          new Date(this.searchDate).toDateString()
      );
    } else if (this.searchValue) {
      // Filtra per gli altri parametri
      this.filteredAppuntamenti = this.appuntamenti.filter((appuntamento) => {
        const properties: { [key: string]: string } = {
          codiceFiscalePaziente: appuntamento.codiceFiscalePaziente,
          trattamento: appuntamento.trattamento,
          // Aggiungi altri parametri se necessario
        };
        return properties[this.selectedParameter]
          .toLowerCase()
          .includes(this.searchValue.toLowerCase());
      });
    } else {
      this.filteredAppuntamenti = this.appuntamenti; // Se il campo di ricerca è vuoto, mostra tutti gli appuntamenti
    }
    this.currentPage = 1; // Resetta alla prima pagina
    this.updatePaginatedResults(); // Aggiorna i risultati paginati
  }

  onSelectAppuntamento(id: string) {
    this.viewDetails.emit(); // Emesso l'evento quando un appuntamento viene selezionato
    this.router.navigate(['/appuntamenti', id]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onNewAppuntamento() {
    this.router.navigate(['new'], { relativeTo: this.route }); //siamo già in /recipes
  }

  nextPage() {
    if (
      this.currentPage * this.itemsPerPage <
      this.filteredAppuntamenti.length
    ) {
      this.currentPage++;
      this.updatePaginatedResults(); // Aggiorna i risultati paginati
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedResults(); // Aggiorna i risultati paginati
    }
  }

  hasNextPage(): boolean {
    return (
      this.currentPage * this.itemsPerPage < this.filteredAppuntamenti.length
    );
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  updatePaginatedResults() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAppuntamenti = this.filteredAppuntamenti.slice(
      startIndex,
      endIndex
    );
  }
}



