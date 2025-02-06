import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FarmacoDialogComponent } from './Dialogs/farmaco-dialog/farmaco-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';
import { StoriaMedica } from './models/storia-medica.model';
import { AppuntamentoService } from 'src/app/appuntamenti/appuntamento.service';
import { AppuntamentoDTO } from 'src/app/appuntamenti/appuntamentoDTO.model';
import { StoriaMedicaService } from './services/storia-medica.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-storia-medica',
  templateUrl: './storia-medica.component.html',
  styleUrls: ['./storia-medica.component.css'],
})
export class StoriaMedicaComponent implements OnInit {
  storiaMedica: StoriaMedica | undefined;
  // allergieColumns: string[] = ['allergene', 'reazione'];
  pazienteId: string | undefined;
  farmaciFiltrati: any[] = [];
  showAttivi: boolean = true; // Stato per il filtro
  showAppuntamentiAttivi: boolean = true;
  farmacoCorrente: any = null;

  percentuali = [
    '0%',
    '10-20%',
    '20-30%',
    '30-40%',
    '40-50%',
    '50-60%',
    '60-70%',
    '70-80%',
    '80-90%',
    '90-100%',
  ];
  dataSource!: MatTableDataSource<any>; // Aggiungi questa variabile per il dataSource

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Riferimento al paginator
  constructor(
    private route: ActivatedRoute,
    private storiaMedicaService: StoriaMedicaService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pazienteId = this.route.snapshot.params['id'];
    this.storiaMedicaService
      .getStoriaMedica(this.pazienteId!)
      .subscribe((data) => {
        this.storiaMedica = data;
        this.filtraFarmaci(this.showAttivi); // Filtra i farmaci inizialmente
        // Carica gli appuntamenti1

        const appuntamentiIds = this.storiaMedica!.farmaciInUso.flatMap(
          (farmaco) => farmaco.appuntamenti
        ).filter((id) => id && typeof id === 'string' && id.trim() !== ''); // Filtra solo gli ID non nulli e non vuoti
        console.log('appuntamentiIds filtrati =', appuntamentiIds);
        // Rimuoviamo eventuali duplicati di ID
        const uniqueAppuntamentiIds = [...new Set(appuntamentiIds)];
        console.log('appuntamentiIds unici =', uniqueAppuntamentiIds);
        // Recuperiamo i dettagli degli appuntamenti
      });
  }

  disattivaFarmaco(farmaco: any, dataFine?: Date): void {
    if (dataFine) {
      if (new Date(dataFine) <= new Date(farmaco.dataInizioTrattamento)) {
        console.error(
          'La data di fine deve essere successiva alla data di inizio!'
        );
        return;
      }
      farmaco.dataFineTrattamento = dataFine;
      farmaco.attivo = false;
    }
    // Marca il farmaco come non attivo
    farmaco.attivo = false;
    // Ora inviamo l'aggiornamento del farmaco nel backend
    this.storiaMedicaService.aggiornaFarmacoInUsoDisattiva(farmaco).subscribe(
      (response) => {
        console.log('Farmaco aggiornato con successo', response);
        // Ricarica la lista dei farmaci per riflettere il cambiamento
        this.filtraFarmaci(this.showAttivi);
      },
      (error) => {
        console.error("Errore nell'aggiornare il farmaco", error);
      }
    );
  }

  aggiornaFarmaco(farmaco: any, dataFine?: Date): void {
    if (dataFine) {
      if (new Date(dataFine) <= new Date(farmaco.dataInizioTrattamento)) {
        console.error(
          'La data di fine deve essere successiva alla data di inizio!'
        );
        return;
      }
      farmaco.dataFineTrattamento = dataFine;
      farmaco.attivo = false;
    }
    // Marca il farmaco come non attivo
    farmaco.attivo = false;
    // Ora inviamo l'aggiornamento del farmaco nel backend
    this.storiaMedicaService.aggiornaFarmacoInUsoDisattiva(farmaco).subscribe(
      (response) => {
        console.log('Farmaco aggiornato con successo', response);
        // Ricarica la lista dei farmaci per riflettere il cambiamento
        this.filtraFarmaci(this.showAttivi);
      },
      (error) => {
        console.error("Errore nell'aggiornare il farmaco", error);
      }
    );
  }

  attivaDatePicker(farmaco: any): void {
    // Mostra il DatePicker solo per il farmaco selezionato
    farmaco.mostraDatePicker = true;
  }

  onDateSelected(farmaco: any, dataFine: Date): void {
    if (
      !dataFine ||
      new Date(dataFine) <= new Date(farmaco.dataInizioTrattamento)
    ) {
      this.mostraErroreData(
        'La data di fine trattamento deve essere successiva a quella di inizio.'
      );
      return;
    }
    // Assegna la data di fine al farmaco
    farmaco.dataFine = dataFine;
    if (!farmaco.efficacia || !farmaco.remissione || !farmaco.dataFine) {
      this.mostraErroreData('Completa tutti i campi per procedere.');
      return;
    }

    // farmaco.mostraDatePicker = false; // Nascondi il DatePicker dopo la selezione
  }

  onEfficaciaSelected(farmaco: any, efficacia: number): void {
    farmaco.efficacia = efficacia;
  }

  onRemissioneSelected(farmaco: any, remissione: number): void {
    farmaco.remissione = remissione;
  }

  verificaCampiCompletati(farmaco: any): void {
    if (farmaco.dataFine && farmaco.efficacia && farmaco.remissione) {
      console.log(
        'Tutti i campi sono stati completati. Pronto per la disattivazione.'
      );
      // Puoi aggiungere logica aggiuntiva qui se necessario
      this.disattivaFarmaco(farmaco, farmaco.dataFine);
    }
  }

  confermaDisattivazione(farmaco: any): void {
    if (!farmaco.dataFine || !farmaco.efficacia || !farmaco.remissione) {
      this.mostraErroreData('Completa tutti i campi prima di confermare.');
      return;
    }
    console.log(
      `Disattivazione confermata per il farmaco: ${farmaco.nomeFarmaco}`
    );

    // Chiamata al metodo di disattivazione
    this.disattivaFarmaco(farmaco, farmaco.dataFine);

    // Nascondi il DatePicker e resetta i flag
    farmaco.mostraDatePicker = false;
  }

  //SEZIONE SNACKBAR ERRORI
  mostraErroreData(messaggio: string): void {
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: 50000, // Durata in millisecondi
      panelClass: ['custom-snackbar'],
      verticalPosition: 'top',
    });
  }

  aggiungiFarmacoInUso(): void {
    this.pazienteId = this.route.snapshot.params['id'];
    console.log(
      'PAZIENTE ID IN STORIA MEDICA PRIMA ALL AGGIUNTA DEL FARMACO : ' +
        this.pazienteId
    );
    const dialogRef = this.dialog.open(FarmacoDialogComponent, {
      width: '500px',
      data: { pazienteId: this.pazienteId! }, // Passa l'ID del paziente al dialogo
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Salva il farmaco in uso nel backend
        this.storiaMedicaService.salvaFarmacoInUso(result).subscribe(
          (response) => {
            console.log('Farmaco salvato con successo:', response);
            // Aggiorna la lista dei farmaci nella storia medica
            if (!this.storiaMedica!.farmaciInUso) {
              this.storiaMedica!.farmaciInUso = [];
            }
            this.storiaMedica!.farmaciInUso.push(response);
            //   this.filtraFarmaci(this.showAttivi); // Aggiorna la lista filtrata
            // Mostra una snackbar di successo
            this.snackBar.open('Farmaco aggiunto con successo!', 'Chiudi', {
              duration: 3000,
              panelClass: ['success-snackbar'], // Classe per stile personalizzato
            });
          },
          (error) => {
            console.error('Errore nel salvataggio del farmaco in uso:', error);
            this.snackBar.open('Errore nel salvataggio del farmaco', 'Chiudi', {
              duration: 3000,
              panelClass: ['error-snackbar'], // Classe per stile personalizzato
            });
          }
        );
      }
    });
  }

  // Metodo per filtrare i farmaci in base allo stato (attivi o non attivi)
  filtraFarmaci(attivi: boolean): void {
    this.showAttivi = attivi;
    this.farmaciFiltrati = this.storiaMedica!.farmaciInUso.filter(
      (farmaco: any) => (attivi ? farmaco.attivo : !farmaco.attivo)
    ).map((farmaco: any) => {
      farmaco.durataAttuale = this.calcolaDurataAttuale(farmaco); // Calcola la durata
      return farmaco;
    });
    // Aggiorna il dataSource dopo aver filtrato i farmaci
    this.dataSource = new MatTableDataSource(this.farmaciFiltrati);
    this.dataSource.paginator = this.paginator; // Imposta il paginator
  }
  calcolaDurataAttuale(farmaco: any): string {
    if (farmaco.dataInizioTrattamento) {
      const dataInizio = new Date(farmaco.dataInizioTrattamento);
      const dataFine = farmaco.dataFineTrattamento
        ? new Date(farmaco.dataFineTrattamento)
        : new Date(); // Usa la data corrente se il trattamento è ancora attivo

      // Calcolo iniziale delle differenze
      let anni = dataFine.getFullYear() - dataInizio.getFullYear();
      let mesi = dataFine.getMonth() - dataInizio.getMonth();
      let giorni = dataFine.getDate() - dataInizio.getDate();

      // Gestione dei giorni negativi
      if (giorni < 0) {
        mesi--;
        const giorniNelMesePrecedente = new Date(
          dataFine.getFullYear(),
          dataFine.getMonth(),
          0
        ).getDate();
        giorni += giorniNelMesePrecedente;
      }

      // Gestione dei mesi negativi
      if (mesi < 0) {
        anni--;
        mesi += 12;
      }

      // Caso: la data di inizio è nel futuro rispetto alla data corrente
      if (dataInizio > dataFine) {
        const diffInMillis = dataInizio.getTime() - dataFine.getTime();
        const diffInGiorni = Math.ceil(diffInMillis / (1000 * 60 * 60 * 24));
        return `-${diffInGiorni} giorni`;
      }

      // Funzione per il formato corretto (singolare/plurale)
      const formatPlurale = (num: number, singolare: string, plurale: string) =>
        num === 1 ? `${num} ${singolare}` : `${num} ${plurale}`;

      // Costruzione della stringa leggibile
      const parti: string[] = [];
      if (anni > 0) {
        parti.push(formatPlurale(anni, 'anno', 'anni'));
      }
      if (mesi > 0) {
        parti.push(formatPlurale(mesi, 'mese', 'mesi'));
      }
      if (giorni > 0) {
        parti.push(formatPlurale(giorni, 'giorno', 'giorni'));
      }

      return parti.length > 0 ? parti.join(', ') : '0 giorni';
    }

    return 'N/A'; // Nel caso in cui non ci sia una data di inizio
  }
  

  get columns(): string[] {
    return this.showAttivi
      ? [
          'nome',
          'dosaggio',
          'frequenza',
          'dataInizioAttivi',
          'azioni',
          'durataAttuale',
        ]
      : [
          'nome',
          'dosaggio',
          'frequenza',
          'dataInizio',
          'dataFine',
          // 'azioniInattivi',
          'durataAttuale2',
          'efficacia',
          'remissione',
        ];
  }

  apriDialogAnamnesi(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '500px',
      data: {
        title: 'Anamnesi',
        content: this.storiaMedica!.anamnesi,
        isEditable: true,
        label: 'Modifica Anamnesi',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== null) {
        this.storiaMedica!.anamnesi = result; // Aggiorna l'anamnesi
      }
      // Forza l'aggiornamento della lista dei farmaci filtrati
      this.filtraFarmaci(this.showAttivi);
    });
  }

  inviaReminder() {
    throw new Error('Method not implemented.');
  }

  vaiAlDettaglioFarmaco(farmaco: any) {
    console.log('PAZ ID: ' + this.pazienteId);
    this.router.navigate(['/farmaci', farmaco.id], {
      queryParams: {
        pazienteId: this.pazienteId,
        farmaco: JSON.stringify(farmaco),
      },
    });
  }
}