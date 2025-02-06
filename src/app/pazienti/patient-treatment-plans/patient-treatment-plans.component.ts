import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { PazienteService } from '../paziente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientTreatmentPlan } from './PatientTreatmentPlan.model';
import { MatDialog } from '@angular/material/dialog';
import { StoriaMedica } from '../lista-operazioni/paziente/storia-medica/pazienti/storia-medica/models/storia-medica.model';
import { StoriaMedicaService } from '../lista-operazioni/paziente/storia-medica/pazienti/storia-medica/services/storia-medica.service';
import {
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TreatmentEvent } from './treatment-event/TreatmentEvent.model';
import { AppuntamentoService } from 'src/app/appuntamenti/appuntamento.service';
import { AppuntamentoDTO } from 'src/app/appuntamenti/appuntamentoDTO.model';
import * as bootstrap from 'bootstrap';
import { MatSort } from '@angular/material/sort';
import { EditAppointmentModalComponent } from 'src/app/modali/edit-appointment-modal/edit-appointment-modal.component';
import { Paziente } from '../paziente.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-patient-treatment-plans',
  templateUrl: './patient-treatment-plans.component.html',
  styleUrls: ['./patient-treatment-plans.component.css'],
})
export class PatientTreatmentPlansComponent implements AfterViewInit {
  pazienteId: string | undefined;
  treatmentPlans: PatientTreatmentPlan[] = []; // Cambiato il tipo
  dropdownStates: boolean[] = []; // Stato individuale per ogni tappa
  newAppointment = {
    id: '',
    dataEOrario: new Date(),
    trattamento: '',
    stato: '',
    note: '',
    codiceFiscalePaziente: '',
    pazienteId: '',
    paziente: new Paziente(
      '', // id
      '', // nome
      '', // cognome
      '', // codiceFiscale
      new Date(), // dataDiNascita
      '', // sesso
      '', // indirizzo
      '', // numeroDiCellulare
      '',
      [] // appuntamentiIds
    ),
  };
  newEvent = {
    descrizione: '',
    dataScade: '',
    completata: false,
    tipologia: '',
  };
  currentPlanId: string | null = null; // Tiene traccia del piano corrente
  storiaMedica: StoriaMedica | undefined;
  farmaciFiltrati: any[] = [];

  tabellaVisibile: boolean = false;
  appointmentsFilters = { stato: '', dataEOrario: null as Date | null };
  eventsFilters = { tipologia: '', dataScade: '' };
  filteredAppointments: AppuntamentoDTO[] = []; // Tappe filtrate
  filteredEvents: TreatmentEvent[] = []; // Eventi filtrati
  showAppointmentModal = false;
  dataSourceFarmaci = new MatTableDataSource<any>(this.farmaciFiltrati);
  dataSourceAppointments = new MatTableDataSource<AppuntamentoDTO>(
    this.filteredAppointments
  );
  dataSourceEvents = new MatTableDataSource<TreatmentEvent>(
    this.filteredEvents
  );
  @ViewChildren(MatPaginator) paginator!: QueryList<MatPaginator>;
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  // Stato delle tabelle
  showAppointmentsTable = true;
  showEventsTable = true;
  availableHours = Array.from({ length: 27 }, (_, i) => 8 + i * 0.5); // Orari: 8:00 - 21:00
  selectedHour: number = 12; // Orario predefinito
  @ViewChild('addAppointmentModal') addAppointmentModal!: ElementRef;
  @ViewChild('addEventModal') addEventModal!: ElementRef;
  orariDisponibili: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private pazienteService: PazienteService,
    private router: Router,
    private dialog: MatDialog,
    private storiaMedicaService: StoriaMedicaService,
    private appuntamentoService: AppuntamentoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.pazienteId = params.get('id')!;
      this.getPatientTreatmentPlans();
      // Dopo aver ottenuto i piani di trattamento, verifica se sono vuoti
      this.checkAndCreateDefaultPlan();
    });
    this.storiaMedicaService
      .getStoriaMedica(this.pazienteId!)
      .subscribe((data) => {
        this.storiaMedica = data;
        this.filtraFarmaci(true);
      });
    // Applica i filtri iniziali per tappe ed eventi
    this.applyAppointmentsFilters();
    this.applyEventsFilters();
    this.generaOrariDisponibili();
  }

  private checkAndCreateDefaultPlan() {
    if (!this.treatmentPlans || this.treatmentPlans.length === 0) {
      // Se non ci sono piani, crea un piano di default nel backend
      this.pazienteService
        .creaPianoDefault(this.pazienteId!)
        .subscribe((newPlan) => {
          // Aggiungi il piano appena creato alla lista dei piani
          this.treatmentPlans = [newPlan];
        });
    }
  }

  // Inizializza il paginator
  ngAfterViewInit() {
    this.dataSourceAppointments.paginator = this.paginator.toArray()[0];
    this.dataSourceAppointments._updateChangeSubscription();

    this.dataSourceEvents.paginator = this.paginator.toArray()[1];
    this.dataSourceEvents._updateChangeSubscription();

    this.dataSourceFarmaci.paginator = this.paginator.toArray()[2];
    this.dataSourceFarmaci._updateChangeSubscription();

    this.assignPaginatorAndSort();
    // Osserva i cambiamenti
    this.paginator.changes.subscribe(() => this.assignPaginatorAndSort());
    this.sort.changes.subscribe(() => this.assignPaginatorAndSort());
    // Applica filtri dopo che le viste sono inizializzate
    this.applyAppointmentsFilters();
    this.applyEventsFilters();
    // Assicurati che il paginator della tabella farmaci sia assegnato quando visibile
  }

  private assignPaginatorAndSort(): void {
    const paginatorArray = this.paginator.toArray();
    const sortArray = this.sort.toArray();
    const dataSources = [
      this.dataSourceFarmaci,
      this.dataSourceAppointments,
      this.dataSourceEvents,
    ];

    // Assegna il paginator e il sort separatamente a ciascun data source

    if (this.showAppointmentsTable && paginatorArray.length > 0) {
      this.dataSourceAppointments.paginator = paginatorArray[0];
      this.dataSourceAppointments.sort = sortArray[0] || null;
    }

    if (this.showEventsTable && paginatorArray.length > 1) {
      this.dataSourceEvents.paginator = paginatorArray[1];
      this.dataSourceEvents.sort = sortArray[1] || null;
    }

    if (this.tabellaVisibile && paginatorArray.length > 2) {
      this.dataSourceFarmaci.paginator = paginatorArray[2];
      this.dataSourceFarmaci.sort = sortArray[2] || null;
    }
  }

  updateAppointmentsFilters(category: string, date?: Date): void {
    this.appointmentsFilters.stato = category;
    if (date) this.appointmentsFilters.dataEOrario = date;
    // this.applyFilters();
  }

  onUpdateAppointment(
    appointmentToUpdate: AppuntamentoDTO,
    planId: string
  ): void {
    this.openEditAppointmentModal(appointmentToUpdate, planId);
  }

  openEditAppointmentModal(appointment: any, planId: string): void {
    console.log('appointment:', appointment, 'PlanId:', planId); // Aggiungi questo log
    const dialogRef = this.dialog.open(EditAppointmentModalComponent, {
      width: '500px',
      data: {
        appointment,
        planId,
      }, // Passa i dati della tappa e del piano
    });

    dialogRef.afterClosed().subscribe((updatedAppointment) => {
      if (updatedAppointment) {
        this.updateAppointmentInPlan(updatedAppointment);
        // Gestisci i dati aggiornati
      }
    });
  }

  // Metodo per aggiornare l'appuntamento nel piano
  updateAppointmentInPlan(updatedAppointment: AppuntamentoDTO): void {
    const plan = this.treatmentPlans.find(
      (plan) => plan.id === this.currentPlanId
    );
    if (plan) {
      const index = plan.appuntamenti.findIndex(
        (app) => app.id === updatedAppointment.id
      );
      if (index !== -1) {
        plan.appuntamenti[index] = updatedAppointment;
      }
    }
  }

  openAddAppointmentModal(planId: string): void {
    // Salva l'ID del piano corrente per riferimento
    this.currentPlanId = planId;
  }

  submitNewAppointment(): void {
    if (
      !this.newAppointment.dataEOrario ||
      !this.newAppointment.note ||
      !this.newAppointment.stato ||
      !this.selectedHour
    ) {
      console.error('Compila tutti i campi obbligatori della tappa.');
      return;
    }
    // Creiamo un oggetto Date combinando data e ora
    const dataSelezionata = new Date(this.newAppointment.dataEOrario);
    dataSelezionata.setHours(this.selectedHour, 0, 0, 0); // Imposta l'orario selezionato

    // Aggiorniamo l'oggetto con il formato corretto
    this.newAppointment.dataEOrario = dataSelezionata;

    // Usando .then() e .catch() per la gestione della Promise
    this.appuntamentoService
      .addAppuntamento(this.newAppointment, this.pazienteId!)
      .then((savedAppuntamento) => {
        this.newAppointment = {
          ...savedAppuntamento,
          paziente:
            savedAppuntamento.paziente ??
            new Paziente(
              '', // id
              '', // nome
              '', // cognome
              '', // codiceFiscale
              new Date(), // dataDiNascita
              '', // sesso
              '', // indirizzo
              '', // numeroDiCellulare
              '',
              [] // appuntamentiIds
            ),
        };

        // 3. Ora possiamo aggiungere l'app al piano di trattamento
        if (this.currentPlanId) {
          this.pazienteService
            .addAppointmentToPlan(
              this.pazienteId!,
              this.currentPlanId,
              this.newAppointment.id
            )
            .subscribe(
              (updatedPlan) => {
                // Aggiorna il piano di trattamento con il nuvo app
                const index = this.treatmentPlans.findIndex(
                  (p) => p.id === this.currentPlanId
                );
                if (index !== -1) {
                  this.treatmentPlans[index] = updatedPlan;
                }
                this.snackBar.open('Appuntamento creato con successo!', 'OK', {
                  duration: 3000, // Durata in millisecondi
                  panelClass: ['success-snackbar'], // Classe personalizzata opzionale
                });
                // **Chiudi il modale dopo un breve ritardo**
                setTimeout(() => this.closeModal(), 100);
                setTimeout(() => {
                  this.resetNewAppointment(); //resetto dati form appunt.
                }, 300);
              },
              (error) => {
                console.error(
                  "Errore durante l'aggiunta dell' appuntamento al piano:",
                  error
                );
              }
            );
        }
      })
      .catch((error) => {
        console.error('Errore nella creazione:', error);
        this.snackBar.open(
          "Errore nella creazione dell'appuntamento",
          'Chiudi',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
      });
  }

  closeModal(): void {
    const modalElement = this.addAppointmentModal.nativeElement;
    const modalInstance =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);

    if (modalInstance) {
      modalInstance.hide();
    }

    // **Rimuove la classe modal-open dal body e il backdrop se rimane bloccato**
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      // Rimuove eventuali backdrop rimasti
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.remove();
      });

      // Forza il reset dello scroll
      document.body.style.overflow = 'auto';
      // **Forza l'aggiornamento della tabella dopo la chiusura**
      this.dataSourceAppointments._updateChangeSubscription();
    }, 300);
  }

  closeEventModal(): void {
    const modalElement = this.addEventModal.nativeElement;
    const modalInstance =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);

    if (modalInstance) {
      modalInstance.hide();
    }

    // **Rimuove la classe modal-open dal body e il backdrop se rimane bloccato**
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      // Rimuove eventuali backdrop rimasti
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.remove();
      });

      // Forza il reset dello scroll
      document.body.style.overflow = 'auto';
      // **Forza l'aggiornamento della tabella dopo la chiusura**
      this.dataSourceEvents._updateChangeSubscription();
    }, 300);
  }

  resetNewAppointment(): void {
    // Resetta i dati del form
    this.newAppointment = {
      id: '',
      dataEOrario: new Date(),
      trattamento: '',
      stato: '',
      note: '',
      codiceFiscalePaziente: '',
      pazienteId: '',
      paziente: new Paziente(
        '', // id
        '', // nome
        '', // cognome
        '', // codiceFiscale
        new Date(), // dataDiNascita
        '', // sesso
        '', // indirizzo
        '', // numeroDiCellulare
        '',
        [] // appuntamentiIds
      ),
    };
  }

  get columns(): string[] {
    return true ? ['nome', 'dosaggio', 'frequenza', 'dataInizioAttivi'] : [];
  }

  // Tasti di visibilità
  toggleTabella(type: 'appointments' | 'events'): void {
    if (type === 'appointments') {
      this.showAppointmentsTable = !this.showAppointmentsTable;
      // this.showEventsTable = false; // Nascondi eventi
    } else if (type === 'events') {
      this.showEventsTable = !this.showEventsTable;
      // this.showStepsTable = false; // Nascondi tappe
    }
    setTimeout(() => this.assignPaginatorAndSort(), 0);
  }

  // Resetta filtri tappe
  resetAppointmentsFilters(): void {
    this.appointmentsFilters = { stato: '', dataEOrario: null };
    this.applyAppointmentsFilters();
  }

  updateEventsFilters(type: string, date?: string): void {
    this.eventsFilters.tipologia = type;
    if (date) this.eventsFilters.dataScade = date;
    // this.applyFilters();
  }

  toggleDropdown(index: number): void {
    this.dropdownStates[index] = !this.dropdownStates[index];
  }

  // Funzione per alternare la visibilità della tabella
  toggleTabellaVisibile(): void {
    this.tabellaVisibile = !this.tabellaVisibile;
    if (this.tabellaVisibile) {
      // this.dataSourceFarmaci.paginator = this.paginatorFarmaci;
      // this.dataSourceFarmaci._updateChangeSubscription(); // Forza l'aggiornamento
      this.dataSourceFarmaci.paginator = this.paginator.toArray()[2];
      this.dataSourceFarmaci._updateChangeSubscription();
    }
  }

  filtraFarmaci(attivi: boolean): void {
    this.farmaciFiltrati = this.storiaMedica!.farmaciInUso.filter(
      (farmaco: any) => (attivi ? farmaco.attivo : !farmaco.attivo)
    ).map((farmaco: any) => {
      return farmaco;
    });
    // Aggiorna il dataSource dopo aver filtrato i farmaci
    this.dataSourceFarmaci.data = this.farmaciFiltrati;
    this.dataSourceFarmaci.paginator = this.paginator.toArray()[0]; // Imposta il paginator
    this.dataSourceFarmaci._updateChangeSubscription();
    // Aggiorna il dataSource dopo aver filtrato i farmaci
    // this.dataSourceFarmaci.data = this.farmaciFiltrati;
    // this.dataSourceFarmaci.paginator = this.paginatorFarmaci; // Imposta il paginator
  }

  getPatientTreatmentPlans(): void {
    this.pazienteService
      .getPatientTreatmentPlansByPatientId(this.pazienteId!)
      .subscribe(
        (treatmentPlans: PatientTreatmentPlan[]) => {
          // Assicurati che questo sia un array di treatmentPlans
          this.treatmentPlans = treatmentPlans;
          console.log('Piani trovati: ', this.treatmentPlans); // Array dei treatment plans

          // Identifica il trattamento attivo e imposta il currentPlanId
          const activePlan = this.treatmentPlans.find((plan) => plan.attivo);
          if (activePlan) {
            this.currentPlanId = activePlan.id;
            // Applica i filtri SOLO dopo aver ricevuto i dati
            this.applyAppointmentsFilters();
            this.applyEventsFilters();
          }
        },
        (error) => {
          console.error('Errore durante il caricamento dei piani: ', error);
        }
      );
  }

  onDeleteAppointment(planId: string, appointmentId: string) {
    console.log(
      'appointmentId: ' +
        appointmentId +
        ' appointmentId: ' +
        appointmentId +
        'pazienteId: ' +
        this.pazienteId
    );
    this.appuntamentoService.deleteAppuntamento(appointmentId).subscribe(
      () => {
        console.log(
          `appointmentId ${appointmentId} eliminato dal piano ${planId}.`
        );
        this.updateTreatmentPlan(planId); // Aggiorna il piano di trattamento
      },
      (error) => {
        console.error(
          "Errore durante l'eliminazione della appointmentId:",
          error
        );
      }
    );
  }
  // Metodo per aggiornare il piano di trattamento
  updateTreatmentPlan(planId: string): void {
    this.pazienteService
      .getTreatmentPlanById(this.pazienteId!, planId)
      .subscribe(
        (updatedPlan) => {
          // Trova il piano modificato e aggiorna i dati
          const index = this.treatmentPlans.findIndex((p) => p.id === planId);
          if (index !== -1) {
            this.treatmentPlans[index] = updatedPlan;
          }
        },
        (error) => {
          console.error("Errore durante l'aggiornamento del app:", error);
        }
      );
  }

  submitNewEvent(): void {
    if (this.currentPlanId) {
      // Chiamata al servizio per aggiungere una nuova tappa
      this.pazienteService
        .addEventToPlan(this.pazienteId!, this.currentPlanId, this.newEvent)
        .subscribe(
          (updatedPlan) => {
            // Aggiorna il piano di trattamento con la nuova tappa
            const index = this.treatmentPlans.findIndex(
              (p) => p.id === this.currentPlanId
            );
            if (index !== -1) {
              this.treatmentPlans[index] = updatedPlan;
            }
            this.snackBar.open('Evento creato con successo!', 'OK', {
              duration: 3000, // Durata in millisecondi
              panelClass: ['success-snackbar'], // Classe personalizzata opzionale
            });
            // **Chiudi il modale dopo un breve ritardo**
            setTimeout(() => this.closeEventModal(), 100);
            setTimeout(() => {
              this.resetNewEvent(); //resetto dati form appunt.
            }, 300);
          },
          (error) => {
            console.error("Errore durante l'aggiunta della tappa:", error);
          }
        );
    }
  }

  resetNewEvent(): void {
    // Resetta i dati del form
    this.newEvent = {
      descrizione: '',
      dataScade: '',
      completata: false,
      tipologia: '',
    };
  }

  // Applica filtri eventi
  applyEventsFilters(): void {
    this.filteredEvents = this.treatmentPlans
      .flatMap((plan) => plan.eventi)
      .filter((event) => {
        const matchesType =
          !this.eventsFilters.tipologia ||
          event.tipologia === this.eventsFilters.tipologia;
        const matchesDate =
          !this.eventsFilters.dataScade ||
          event.dataScade === this.eventsFilters.dataScade;
        return matchesType && matchesDate;
      });
    // Aggiorna il data source e forza il refresh
    this.dataSourceEvents.data = this.filteredEvents;
    this.dataSourceEvents._updateChangeSubscription();
  }

  // Applica filtri appuntamenti
  applyAppointmentsFilters(): void {
    this.filteredAppointments = this.treatmentPlans
      .flatMap((plan) => plan.appuntamenti)
      .filter((appointment) => {
        if (!appointment) return false; // Evita errori su undefined/null
        const matchesCategory =
          !this.appointmentsFilters.stato ||
          appointment.stato === this.appointmentsFilters.stato;
        const matchesDate =
          !this.appointmentsFilters.dataEOrario ||
          this.areDatesEqual(
            appointment.dataEOrario,
            this.appointmentsFilters.dataEOrario
          );
        return matchesCategory && matchesDate;
      });
    // Aggiorna il data source e forza il refresh
    this.dataSourceAppointments.data = this.filteredAppointments;
    this.dataSourceAppointments._updateChangeSubscription();
  }

  // Funzione di supporto per confrontare le date
  areDatesEqual(date1: any, date2: any): boolean {
    const parsedDate1 = new Date(date1);
    const parsedDate2 = new Date(date2);
    if (isNaN(parsedDate1.getTime()) || isNaN(parsedDate2.getTime())) {
      console.error('Date non valide:', { date1, date2 });
      return false; // Gestisci il caso di date non valide
    }
    return (
      parsedDate1.getFullYear() === parsedDate2.getFullYear() &&
      parsedDate1.getMonth() === parsedDate2.getMonth() &&
      parsedDate1.getDate() === parsedDate2.getDate()
    );
  }

  // Resetta filtri eventi
  resetEventsFilters(): void {
    this.eventsFilters = { tipologia: '', dataScade: '' };
    this.applyEventsFilters();
  }

  vaiAiDettagli(appuntamento: AppuntamentoDTO) {
    if (appuntamento.id) {
      this.router.navigate(['/appuntamenti', appuntamento.id]); // Naviga ai dettagli
    } else {
      console.error('ID appuntamento non valido');
    }
  }

  private generaOrariDisponibili() {
    this.orariDisponibili = [];
    for (let ora = 8; ora <= 20; ora++) {
      this.orariDisponibili.push(`${ora}:00`, `${ora}:30`);
    }
  }
}
