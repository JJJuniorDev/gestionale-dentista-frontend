import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FarmacoService } from '../../services/farmaco.service';
import { StoriaMedicaService } from '../../services/storia-medica.service';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-farmaco-dialog',
  templateUrl: './farmaco-dialog.component.html',
  styleUrls: ['./farmaco-dialog.component.css'],
})
export class FarmacoDialogComponent implements OnInit {
  farmaci: any[] = []; // Array di farmaci
  farmacoSelezionato: any | null = null; // Farmaco selezionato
  categorie: string[] = []; // Array di categorie
  categoriaSelezionata: string = ''; // Categoria selezionata
  nomeFarmaco: string = ''; // Nome del farmaco da cercare
  pazienteId: string; // Variabile per memorizzare l'ID del paziente
  dosaggiComuni: string[] = [
    '1mg',
    '5mg',
    '10mg',
    '6 gocce',
    '1 compressa',
    '2 gocce',
  ]; // Dosaggi comuni
  frequenzeComuni: string[] = [
    '1 volta al giorno',
    '2 volte al giorno',
    '3 volte al giorno',
    '1 volta ogni 12 ore',
    '1 volta ogni 8 ore',
    '1 compressa al mattino',
    '1 compressa alla sera',
    '1 compressa dopo i pasti',
    '1 compressa prima dei pasti',
    '2 gocce ogni 6 ore',
    '1 iniezione al giorno',
    '1 bustina al bisogno',
    '1 applicazione ogni 12 ore',
    '2 compresse ogni 4 ore',
  ];
  isDosaggioAltro: boolean = false; // Indica se l'utente ha selezionato "Altro" per il dosaggio
  isFrequenzaAltro: boolean = false;
  //visibleFarmaci: number = 4; // Numero di farmaci visibili per ogni scroll
  paginaCorrente: number = 0; // Pagina corrente
  itemsPerPage: number = 4; // Numero massimo di elementi per pagina
  totaleElementi: number = 0; // Totale farmaci disponibili per la query
  private categoriaModificata: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Iniettare i dati passati al dialogo
    public dialogRef: MatDialogRef<FarmacoDialogComponent>, // Iniettare MatDialogRef per chiudere il dialogo
    private farmacoService: FarmacoService, // Iniettare il servizio farmaco
    private storiaMedicaService: StoriaMedicaService // Iniettare il servizio storia medica
  ) {
    console.log('PAZIENTE ID IN FARMACO DIALOG: ' + data.pazienteId);
    this.pazienteId = data.pazienteId; // Ottieni l'ID del paziente passato nel dialogo
  }

  ngOnInit(): void {
    this.ottieniCategorie(); // Ottieni le categorie all'inizio
    this.pazienteId = this.data.pazienteId;
  }

  // Metodo per ottenere le categorie dal backend
  ottieniCategorie(): void {
    this.farmacoService.ottieniCategorie().subscribe(
      (response) => {
        this.categorie = response; // Aggiunge le categorie ricevute dal backend
      },
      (error) => {
        console.error('Errore nel recupero delle categorie', error);
      }
    );
  }

  // Metodo per cercare farmaci per nome
  cercaPerNome(): void {
    if (this.nomeFarmaco) {
      const nomeCorretto = this.nomeFarmaco.trim();
      this.farmacoService.cercaFarmaco(nomeCorretto).subscribe(
        (response) => {
          this.farmaci = response;
          //  this.visibleFarmaci = 4; // Reset numero visibile farmaci
        },
        (error) => {
          console.error('Errore nella ricerca per nome', error);
        }
      );
    }
  }

  // Metodo per cercare farmaci in base alla categoria
  cercaPerCategoria(): void {
    if (this.categoriaSelezionata) {
      const categoriaCorretta = this.categoriaSelezionata.trim();

      // Se la categoria è cambiata, resettiamo la pagina a 0
      if (this.categoriaModificata) {
        this.paginaCorrente = 0;
        this.categoriaModificata = false;
      }

      this.farmacoService
        .cercaFarmaciPerCategoriaPaginata(
          categoriaCorretta,
          this.paginaCorrente,
          this.itemsPerPage
        )
        .subscribe(
          (response: any) => {
            console.log('RESPONSE: ' + response);
            this.farmaci = response.farmaci;
            this.totaleElementi = response.totaleElementi;
            this.paginaCorrente = response.paginaCorrente;
            console.log(`Pagina corrente aggiornata: ${this.paginaCorrente}`);
          },
          (error) => {
            console.error('Errore nella ricerca per categoria', error);
          }
        );
    }
  }

  // Metodo per gestire il cambio di categoria
  onCategoriaChange(): void {
    this.categoriaModificata = true; // Impostiamo il flag per indicare che la categoria è cambiata
    this.cercaPerCategoria(); // Richiamiamo il metodo di ricerca farmaci per la nuova categoria
  }

  paginaCambiata(event: PageEvent): void {
    this.paginaCorrente = event.pageIndex; // Aggiungi 1 perché la paginazione backend è 1-based
    this.itemsPerPage = event.pageSize; // Aggiorna il numero di elementi per pagina
    this.cercaPerCategoria(); // Ricarica i dati per la nuova pagina
  }
  //

  selezionaFarmaco(farmaco: any): void {
    this.farmacoSelezionato = farmaco; // Imposta il farmaco selezionato
    console.log('Farmaco selezionato:', this.farmacoSelezionato); // Debug
  }

  // Metodo che viene chiamato quando cambia la selezione del dosaggio
  onDosaggioChange(): void {
    this.isDosaggioAltro = this.farmacoSelezionato?.dosaggio === 'altro'; // Se "Altro" è selezionato, mostriamo l'input per il dosaggio personalizzato
  }

  onFrequenzaChange(): void {
    this.isFrequenzaAltro = this.farmacoSelezionato?.frequenza === 'altro';
  }
  // Metodo per confermare l'aggiunta del farmaco con dosaggio e frequenza
  confermaAggiuntaFarmaco(): void {
    if (
      !this.farmacoSelezionato ||
      (!this.farmacoSelezionato.dosaggio &&
        !this.farmacoSelezionato.dosaggioPersonalizzato) ||
      (!this.farmacoSelezionato.frequenza &&
        !this.farmacoSelezionato.frequenzaPersonalizzato) ||
      !this.farmacoSelezionato.dataInizioTrattamento
    ) {
      alert(
        'Completa tutti i campi obbligatori: dosaggio, frequenza e data di inizio trattamento.'
      );
      return;
    }

    const farmacoInUso = {
      pazienteId: this.pazienteId,
      nomeFarmaco: this.farmacoSelezionato.nomeFarmaco,
      dosaggio:
        this.farmacoSelezionato.dosaggio === 'altro'
          ? this.farmacoSelezionato.dosaggioPersonalizzato
          : this.farmacoSelezionato.dosaggio,
      frequenza:
        this.farmacoSelezionato.frequenza === 'altro'
          ? this.farmacoSelezionato.frequenzaPersonalizzato
          : this.farmacoSelezionato.frequenza,
      dataInizioTrattamento: this.farmacoSelezionato.dataInizioTrattamento,
      dataFineTrattamento: this.farmacoSelezionato.dataFineTrattamento || null, // Facoltativo
      attivo: true, // Impostato automaticamente
    };
this.dialogRef.close(farmacoInUso);
  }
}
