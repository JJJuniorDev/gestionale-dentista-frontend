import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Paziente } from '../paziente.model';
import {  PazienteService } from '../paziente.service';

@Component({
  selector: 'app-lista-pazienti',
  templateUrl: './lista-pazienti.component.html',
  styleUrls: ['./lista-pazienti.component.css'],
})
export class ListaPazientiComponent implements OnInit, OnDestroy {
  pazienti: Paziente[] = [];
  subscription!: Subscription;
  appuntamentiIds: any;
  selectedParameter: string = 'codiceFiscalePaziente';
  searchValue: string = ''; //inserito dall'utente
  filteredPazienti: Paziente[] = [];
  paginatedPazienti: Paziente[] = []; // Array per pazienti paginati
  itemsPerPage: number = 3; // Numero di elementi per pagina
  currentPage: number = 1; // Pagina corrente

  constructor(
    private pazienteService: PazienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscription = this.pazienteService.pazientiChanged.subscribe(
      (pazienti: Paziente[]) => {
        //se abbiamo cambiato qualcosa riceviamo il nuovo array
        this.pazienti = pazienti; //assegno le nostre operazioni alle nuove ricevute
        this.filteredPazienti = this.pazienti;
        this.updatePaginatedResults(); // Assicurati che i dati siano aggiornati dopo averli ricevuti
      }
    );
    this.pazienteService
      .getPazienti()
      .subscribe((pazienti: Paziente[]) => {
        this.pazienti = pazienti;
         console.log(
           'Appuntamenti per ogni paziente:',
           this.pazienti.map((p) => ({
             id: p.id,
             appuntamentiIds: p.appuntamentiIds,
      
           }))
         );
   this.filteredPazienti = this.pazienti;
        this.updatePaginatedResults();
      });
  }

  onSearch() {
   
    if (this.searchValue) {
      const searchValue = this.searchValue.toLowerCase();
      this.filteredPazienti = this.pazienti.filter((paziente) => {
        const patientProperties: { [key: string]: string } = {
          codiceFiscalePaziente: paziente.codiceFiscale,
          nome: paziente.nome,
          cognome: paziente.cognome,
          numeroDiCellulare: paziente.numeroDiCellulare,
          indirizzo: paziente.indirizzo,
          sesso: paziente.sesso,
          // Aggiungi altri parametri se necessario
        };

        const fieldValue =
          patientProperties[this.selectedParameter]?.toLowerCase(); // Trasforma il valore del campo in minuscolo

        // Confronta il valore di ricerca con il valore del campo in minuscolo
        return fieldValue?.includes(searchValue);
      });
    } else {
      this.filteredPazienti = this.pazienti;
    }
    this.currentPage = 1; // Resetta alla prima pagina
    this.updatePaginatedResults(); // Aggiorna i risultati paginati
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onNewPatient() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredPazienti.length) {
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
    return this.currentPage * this.itemsPerPage < this.filteredPazienti.length;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  updatePaginatedResults() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPazienti = this.filteredPazienti.slice(
      startIndex,
      endIndex
    );
  }

  onSelectPaziente(id: string) {
  //  this.viewDetails.emit(); // Emesso l'evento quando un appuntamento viene selezionato
    this.router.navigate(['/pazienti', id]);
  }
}
