import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppuntamentoService } from "src/app/appuntamenti/appuntamento.service";

@Component({
  // Aggiungi il decoratore @Component
  selector: 'app-appuntamenti-paziente', // Il selettore HTML per il componente
  templateUrl: './appuntamenti-paziente.component.html', // Path al template HTML del componente
  styleUrls: ['./appuntamenti-paziente.component.css'], // Path ai file di stile (opzionale)
})
export class AppuntamentiPazienteComponent implements OnInit {
  appuntamenti: any[] = [];
  paginatedAppointments: any[] = [];
  pazienteId: string | undefined;
  appuntamentiIds: string[] = [];

  // Paginazione
  itemsPerPage: number = 3;
  currentPage: number = 1;
  totalPages: number = 1;

  // Ordinamento
  sortCriteria: string = 'dataEOrario';
  sortAscending: boolean = false; // Default: dal più recente al meno recente

  constructor(
    private route: ActivatedRoute,
    private appuntamentoService: AppuntamentoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.pazienteId = params.get('id')!;
      this.appuntamentiIds = history.state.appuntamentiIds || [];

      if (this.appuntamentiIds.length > 0) {
        this.getAppuntamenti();
      }
    });
  }

  getAppuntamenti() {
    this.appuntamentoService
      .getAppuntamentiByIds(this.appuntamentiIds)
      .subscribe(
        (appuntamenti) => {
          this.appuntamenti = appuntamenti;
          this.sortAppointments(); // Ordina e aggiorna la paginazione
        },
        (error) =>
          console.error('Errore nel caricamento degli appuntamenti:', error)
      );
  }

  sortAppointments() {
    this.appuntamenti.sort((a, b) => {
      let valueA = a[this.sortCriteria];
      let valueB = b[this.sortCriteria];

      if (this.sortCriteria === 'dataEOrario') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      return this.sortAscending ? valueA - valueB : valueB - valueA;
    });

    this.currentPage = 1; // Resetta la pagina
    this.updatePagination();
  }

  toggleSortOrder() {
    this.sortAscending = !this.sortAscending;
    this.sortAppointments();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.appuntamenti.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAppointments = this.appuntamenti.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getStatoIcon(stato: string): string {
  switch (stato?.toLowerCase()) {
    case 'completato':
      return '✅';
    case 'in_corso':
      return '⏳';
    case 'pianificato':
      return '✔️';
    case 'annullato':
      return '❌';
    case 'sospeso':
      return '🔄';
    default:
      return '❓'; // Per stati sconosciuti
  }
}
}