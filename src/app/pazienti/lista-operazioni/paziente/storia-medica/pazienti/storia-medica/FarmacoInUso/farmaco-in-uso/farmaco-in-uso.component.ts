import { Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotaDialogComponent } from '../../Dialogs/nota-dialog/nota-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AppuntamentoDTO } from 'src/app/appuntamenti/appuntamentoDTO.model';
import { AppuntamentoService } from 'src/app/appuntamenti/appuntamento.service';
import { StoriaMedica } from '../../models/storia-medica.model';
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';
import { Farmaco } from '../../models/farmaco.model';
import { StoriaMedicaService } from '../../services/storia-medica.service';
import { FarmacoService } from '../../services/farmaco.service';
import { NoteService } from '../../services/note.service';
import { Nota } from '../../models/nota.model';
import { MatTableDataSource } from '@angular/material/table';
import { NotaDTO } from '../../models/notaDTO.model';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-farmaco-in-uso',
  templateUrl: './farmaco-in-uso.component.html',
  styleUrls: ['./farmaco-in-uso.component.css'],
})
export class FarmacoInUsoComponent implements OnChanges {
  farmacoInUso: any;
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any> | undefined;
  pazienteId: string | undefined;
  storiaMedica: StoriaMedica | undefined;
  appuntamento: AppuntamentoDTO = new AppuntamentoDTO(
    '', // id
    new Date(), // dataEOrario
    '', // codiceFiscalePaziente
    '', // trattamento
    '', // note
    '', // pazienteId
    '', // stato,
    null,
    ''
  );
  farmaco?: Farmaco;
  displayedColumns: string[] = [
    'nomeFarmaco',
    'categoria',
    'classeTerapeutica',
    'principioAttivo',
    'indicazioni',
    'controindicazioni',
    'effettiCollaterali',
    'interazioni',
  ];
  datasource: Farmaco[] = [];
  note: any[] = [];
  tableDataSource = new MatTableDataSource<Nota>();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private storiaMedicaService: StoriaMedicaService,
    private farmacoService: FarmacoService,
    private noteService: NoteService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.pazienteId = params['pazienteId'];
      this.farmacoInUso = JSON.parse(params['farmaco']);
      console.log('Paziente ID:', this.pazienteId);
      console.log('Farmaco:', this.farmacoInUso);
    });
    this.storiaMedicaService
      .getStoriaMedica(this.pazienteId!)
      .subscribe((data) => {
        this.storiaMedica = data;
      });
    if (this.farmacoInUso) {
      console.log(this.farmacoInUso);
    } else {
      // Gestione errore o fallback
      console.error('Nessun farmaco trovato nello stato del router');
    }
    if (this.farmacoInUso.farmacoId) {
      this.farmacoService.getFarmacoById(this.farmacoInUso.farmacoId).subscribe(
        (data) => {
          this.farmaco = data;
          this.datasource = [this.farmaco]; // Assegna un array con un solo elemento
          console.log('Datasource:', this.datasource); // Aggiungi un log per verificare
        },
        (error) => {
          console.error('Errore durante il recupero del farmaco:', error);
        }
      );
    }
    // Recupera le note e ordinale per data
    this.noteService.getNotesByIds(this.farmacoInUso.note || []).subscribe({
      next: (notes) => {
        this.note = notes.map((nota) => ({
          ...nota,
          expanded: false, // Aggiungi una proprietà expanded inizialmente impostata su false
        }));
        this.note.sort(
          (a, b) =>
            new Date(b.dataCreazione).getTime() -
            new Date(a.dataCreazione).getTime()
        ); // Ordina per data decrescente
        // Aggiorna la dataSource con tutte le note
        this.tableDataSource.data = this.note;
        this.tableDataSource.paginator = this.paginator!; // Associa il paginator
      },
      error: (err) => {
        console.error('Errore durante il recupero delle note:', err);
      },
    });
  }

  aggiungiNota(farmacoInUsoId: string): void {
    console.log('ID del farmaco per aggiungere la nota: ' + farmacoInUsoId);

    // Apri il dialog per aggiungere la nota
    const dialogRef = this.dialog.open(NotaDialogComponent, {
      width: '500px',
      data: { farmacoInUsoId: farmacoInUsoId }, // Passa l'ID del farmaco in uso al dialog
    });

    // Azione dopo la chiusura del dialog
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Salva la nota nel backend
        this.storiaMedicaService.aggiungiNota(result).subscribe(
          (response) => {
            console.log('Nota salvata con successo:', response);

            // Aggiorna la lista delle note nel farmaco in uso
            const farmacoInUsoG = this.storiaMedica!.farmaciInUso.find(
              (f) => f.id === farmacoInUsoId
            );
            if (farmacoInUsoG) {
              if (!farmacoInUsoG.note) {
                farmacoInUsoG.note = [];
              }
              farmacoInUsoG.note.push(response.id);
            }
          },
          (error) => {
            console.error('Errore nel salvataggio della nota:', error);
          }
        );
      }
    });
  }

  // Metodo per aprire il dialog e impostare il farmaco corrente
  apriDialogModifica(farmaco: any, templateRef: TemplateRef<any>): void {
    this.farmacoInUso = { ...farmaco }; // Copia l'oggetto per evitare modifiche non intenzionali
    this.dialog.open(templateRef, {
      width: '500px',
    });
  }

  // Metodo per salvare le modifiche
  salvaModifiche(dialogRef: MatDialogRef<any>): void {
    console.log('Oggetto inviato al backend:', this.farmacoInUso);
    this.storiaMedicaService.modificaFarmacoInUso(this.farmacoInUso).subscribe(
      (response) => {
        console.log('Risposta dal backend:', response);

        // Aggiorna l'elenco dei farmaci nella lista filtrata
        const index = this.storiaMedica!.farmaciInUso.findIndex(
          (farmaco: any) => farmaco.id === this.farmacoInUso.id
        );
        if (index !== -1) {
          this.storiaMedica!.farmaciInUso[index] = response;
          // this.filtraFarmaci(this.showAttivi);
        }

        dialogRef.close(); // Chiudi il dialog
      },
      (error) => {
        console.error("Errore nell'aggiornamento del farmaco:", error);
      }
    );
  }

  onNoClick(): void {
    console.log('Operazione annullata.');
  }

  eliminaFarmaco(farmaco: any): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '300px',
      data: { message: 'Sei sicuro di voler eliminare questo farmaco?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.storiaMedicaService
          .eliminaFarmacoInUso(farmaco.id, farmaco.pazienteId)
          .subscribe(
            (response) => {
              console.log('Farmaco eliminato con successo:', response);
            },
            (error) => {
              console.error("Errore nell'eliminazione del farmaco:", error);
            }
          );
      }
    });
  }
}
