import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';
import { AuthService } from 'src/app/auth/auth.service';
import { forkJoin, switchMap, take } from 'rxjs';
import { EventoDTO } from 'src/app/appuntamenti/eventoDTO.model';
import { Toast, ToastrService } from 'ngx-toastr';

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
    dottoreId: '',
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
    dataEOrario: new Date(),
    deleted: false,
    tipologia: '',
    dottoreId: '',
  };
  currentPlanId: string | null = null; // Tiene traccia del piano corrente
  storiaMedica: StoriaMedica | undefined;
  farmaciFiltrati: any[] = [];

  tabellaVisibile: boolean = false;
  appointmentsFilters = { stato: '', dataEOrario: null as Date | null };
  eventsFilters = { tipologia: '', dataEOrario: '' };
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
  trattamentoSelezionato: PatientTreatmentPlan | null = null; // Aggiunto il campo
  eventi: TreatmentEvent[] = [];
  appuntamenti: AppuntamentoDTO[] = [];
  showCreateButton: boolean = false;
  dottoreId: string | undefined;
  newAppointmentDate: string = ''; // Oppure Date se vuoi gestire il valore come oggetto data
  newAppointmentHour: string = ''; // Formato orario, es: '14:30'
  newEventDate: string = '';
  newPlanName: string = '';
  pianoAttivo: boolean = false;

  showNoPlanAlert = false;
  loadingTreatmentPlans = true;

  showNoActivePlanAlert() {
    this.showNoPlanAlert = true;
  }

  dismissAlert() {
    this.showNoPlanAlert = false;
  }

  constructor(
    private route: ActivatedRoute,
    private pazienteService: PazienteService,
    private router: Router,
    private dialog: MatDialog,
    private storiaMedicaService: StoriaMedicaService,
    private appuntamentoService: AppuntamentoService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private toastR: ToastrService
  ) {}

  aggiungiDueOre(data: any): string {
    const dataObj = new Date(data); // Converte stringa in Date
    const nuovaData = new Date(dataObj.getTime() + 2 * 60 * 60 * 1000);
    return nuovaData.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      this.dottoreId = user?.id!;
      this.newEvent.dottoreId = this.dottoreId;
    });
    console.log('DOTTORE ID : ' + this.dottoreId);
    this.route.paramMap.subscribe((params) => {
      this.pazienteId = params.get('id')!;
      this.dismissAlert();
      this.getPatientTreatmentPlans();
      // Dopo aver ottenuto i piani di trattamento, verifica se sono vuoti
      //   this.checkAndCreateDefaultPlan();
    });
    this.storiaMedicaService
      .getStoriaMedica(this.pazienteId!)
      .subscribe((data) => {
        this.storiaMedica = data;
        this.filtraFarmaci(true);
      });
    this.generaOrariDisponibili();
  }

  selezionaTrattamento(trattamento: any) {
    this.currentPlanId = trattamento.id; // Salva l'ID del piano attivo
    this.applyAppointmentsFilters(); // Filtra gli appuntamenti per questo trattamento
    this.applyEventsFilters(); // Filtra gli eventi per questo trattamento
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

    console.log('Data selezionata:', this.newAppointmentDate);
    console.log('Orario selezionato:', this.newAppointmentHour);

    // Creiamo una data completa
    const [hour, minute] = this.newAppointmentHour.split(':').map(Number);
    const selectedDateTime = new Date(this.newAppointmentDate);
    selectedDateTime.setHours(hour, minute, 0, 0); // Imposta ora e minuti

    console.log('DATA COMPLETA:', selectedDateTime.toISOString());

    if (isNaN(selectedDateTime.getTime())) {
      console.error('Errore: Data non valida!');
      return;
    }

    // Controllo se esiste già un appuntamento alla stessa ora
    const appuntamentoEsistente = this.appuntamenti.find(
      (app) =>
        new Date(app.dataEOrario).getTime() === selectedDateTime.getTime()
    );

    if (appuntamentoEsistente) {
      alert('Errore: Esiste già un appuntamento a questa data e ora!');
      return;
    }

    // Aggiorniamo `dataEOrario` con il valore corretto
    this.newAppointment.dataEOrario = new Date(selectedDateTime);

    this.appuntamentoService
      .addAppuntamento(this.newAppointment, this.pazienteId!, this.dottoreId!)
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
                this.toastR.success(
                  'Appuntamento creato con successo!',
                  'Successo',
                  {
                    timeOut: 3000, // Durata 3 secondi
                    positionClass: 'toast-top-center', // Posizione nell'angolo in basso a destra
                    progressBar: true, // Barra di progresso
                    closeButton: true, // Bottone per chiudere
                  }
                );
                // **Chiudi il modale dopo un breve ritardo**
                // setTimeout(() => this.closeModal(), 100);
                setTimeout(() => {
                  let modalElement = document.getElementById(
                    'addAppointmentModal'
                  );
                  if (modalElement) {
                    let modalBootstrap =
                      bootstrap.Modal.getInstance(modalElement);
                    if (modalBootstrap) {
                      modalBootstrap.hide(); // Chiude il modale
                      modalBootstrap.dispose(); // Dispose the instance after hiding it
                    }
                  }

                  let backdrops = document.querySelectorAll('.modal-backdrop');
                  if (backdrops.length > 0) {
                    backdrops.forEach((backdrop) => {
                      backdrop.remove();
                    });
                  }
                  document.body.classList.remove('modal-open');
                  document.body.style.overflow = 'auto';
                  document.body.scrollTop = 0; // Imposta la posizione di scroll all'inizio
                  document.documentElement.scrollTop = 0; // Imposta la posizione di scroll all'inizio
                  let mainContent = document.getElementById('mainContent'); // Modifica con un ID valido nella tua pagina
                  if (mainContent) {
                    mainContent.focus(); // Imposta il focus sull'elemento principale
                  }
                  document.documentElement.style.scrollBehavior = 'auto';
                  document.documentElement.style.overflow = 'visible';
                  document.body.offsetHeight; // Trigger reflow
                  this.appuntamenti.push(savedAppuntamento);
                  this.cdRef.detectChanges();
                  this.resetNewAppointment(); //resetto dati form appunt.

                  setTimeout(() => {
                    document.body.style.overflow = 'auto'; // Reset overflow con ulteriore ritardo
                  }, 50);
                }, 200);
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
        this.toastR.error(
          "Errore nella creazione dell'appuntamento",
          'Errore',
          {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            progressBar: true,
            closeButton: true,
          }
        );
      });
  }

  closeModal(modalId?: string): void {
    // Se è stato passato un ID, trova il modale con quell'ID, altrimenti usa addAppointmentModal
    const modalElement = modalId
      ? document.getElementById(modalId)
      : this.addAppointmentModal.nativeElement;

    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
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

      // **Forza l'aggiornamento della tabella solo se è il modale degli appuntamenti**
      if (!modalId || modalId === 'addAppointmentModal') {
        this.dataSourceAppointments._updateChangeSubscription();
      }
    }, 300);
  }

  closeEventModal(): void {
    const modalElement = this.addEventModal.nativeElement;
    const modalInstance =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);

    if (modalInstance) {
      modalInstance.hide();
      modalInstance.dispose();
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
      dottoreId: '',
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
    if (date) this.eventsFilters.dataEOrario = date;
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
    this.loadingTreatmentPlans = true;
    this.pazienteService
      .getPatientTreatmentPlansByPatientId(this.pazienteId!)
      .subscribe(
        (treatmentPlans: PatientTreatmentPlan[]) => {
          // Assicurati che questo sia un array di treatmentPlans
          this.treatmentPlans = treatmentPlans;
          this.loadingTreatmentPlans = false; // Fine caricamento
          console.log('Piani trovati: ', this.treatmentPlans); // Array dei treatment plans

          // Identifica il trattamento attivo e imposta il currentPlanId
          const activePlan = this.treatmentPlans.find((plan) => plan.attivo);
          if (activePlan) {
            this.pianoAttivo = true;
            this.currentPlanId = activePlan.id;
            this.trattamentoSelezionato = activePlan; // Seleziona automaticamente il piano attivo
            // Applica i filtri SOLO dopo aver ricevuto i dati
            this.applyAppointmentsFilters();
            this.applyEventsFilters();
          } else {
            this.showNoActivePlanAlert();
            this.pianoAttivo = false;
             this.currentPlanId = null;
             this.trattamentoSelezionato = null;
          }
        },
        (error) => {
          console.error('Errore durante il caricamento dei piani: ', error);
          this.loadingTreatmentPlans = false;
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
      const selectedDateTime = new Date(this.newEventDate);
      this.newEvent.dataEOrario = selectedDateTime;
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
            this.toastR.success('Evento creato con successo!', 'Successo', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              progressBar: true,
              closeButton: true,
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
      dataEOrario: new Date(),
      deleted: false,
      tipologia: '',
      dottoreId: '',
    };
  }

  // Applica filtri eventi
  applyEventsFilters(): void {
    if (!this.trattamentoSelezionato) return; // Se nessun trattamento è selezionato, esci

    this.filteredEvents = this.trattamentoSelezionato.eventi.filter((event) => {
      const matchesType =
        !this.eventsFilters.tipologia ||
        event.tipologia === this.eventsFilters.tipologia;
      const matchesDate =
        !this.eventsFilters.dataEOrario ||
        event.dataEOrario === this.eventsFilters.dataEOrario;
      return matchesType && matchesDate;
    });
    // Aggiorna il data source e forza il refresh
    this.dataSourceEvents.data = this.filteredEvents;
    this.dataSourceEvents._updateChangeSubscription();
  }

  // Applica filtri appuntamenti
  applyAppointmentsFilters(): void {
    if (!this.trattamentoSelezionato) return; // Se nessun trattamento è selezionato, esci
    this.filteredAppointments = (this.trattamentoSelezionato.appuntamenti || [])
      // .flatMap((plan) => plan.appuntamenti)
      .filter((appointment) => {
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
        // this.filteredAppointments = this.trattamentoSelezionato.appuntamenti.filter(
        //   (appointment) => {
        //     const matchesCategory =
        //       !this.appointmentsFilters.stato ||
        //       appointment.stato === this.appointmentsFilters.stato;
        //     const matchesDate =
        //       !this.appointmentsFilters.dataEOrario ||
        //       this.areDatesEqual(
        //         appointment.dataEOrario,
        //         this.appointmentsFilters.dataEOrario
        //       );
        //     return matchesCategory && matchesDate;
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
    this.eventsFilters = { tipologia: '', dataEOrario: '' };
    this.applyEventsFilters();
  }

  vaiAiDettagliAppuntamento(appuntamento: AppuntamentoDTO) {
    if (appuntamento.id) {
      this.router.navigate(['/appuntamenti', appuntamento.id]); // Naviga ai dettagli
    } else {
      console.error('ID appuntamento non valido');
    }
  }

  vaiAiDettagliEvento(evento: EventoDTO) {
    if (evento.id) {
      this.router.navigate(['/eventi', evento.id]);
    }
  }

  private generaOrariDisponibili() {
    this.orariDisponibili = [];
    for (let ora = 8; ora <= 20; ora++) {
      this.orariDisponibili.push(`${ora}:00`, `${ora}:30`);
    }
  }

  openConfirmationModal(treatmentPlanId: string): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: {
        content: 'Sei sicuro di voler disattivare questo piano di trattamento?',
        isEditable: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deactivateTreatmentPlan(treatmentPlanId);
      }
    });
  }

  deactivateTreatmentPlan(treatmentPlanId: string): void {
    this.pazienteService.deactivatePlan(treatmentPlanId).subscribe({
      next: () => {
        console.log('Piano di trattamento disattivato con successo');
        this.pianoAttivo = false;

        // ✅ Mostra toast di successo con Toastr
        this.toastR.success(
          'Piano di trattamento disattivato con successo.',
          'Successo',
          {
            timeOut: 3000, // Durata del messaggio
            positionClass: 'toast-top-center', // Posizione del toast al centro in alto
            progressBar: true, // Aggiungi una barra di progresso
            closeButton: true, // Aggiungi un pulsante di chiusura
          }
        );

        // ✅ Ricarica dati (es. refresh della lista)
        this.refreshTreatmentPlans();
      },
      error: (err) => {
        console.error('Errore durante la disattivazione:', err);

        // ❌ Mostra toast di errore con Toastr
        this.toastR.error(
          'Si è verificato un errore durante la disattivazione',
          'Errore',{
            timeOut: 3000, // Durata del messaggio
            positionClass: 'toast-top-center', 
          }
        );
      },
    });

    console.log('Piano attivo passa da: ' + this.pianoAttivo + ' a false.');
  }

  refreshTreatmentPlans(): void {
    this.getPatientTreatmentPlans(); 
  }

  // Funzione per aprire/chiudere modali dinamicamente
  toggleModal(modalId: string, action: 'show' | 'hide') {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      if (action === 'show') {
        modalInstance.show();
      } else {
        modalInstance.hide();
      }
      // 🔥 Rimuove manualmente eventuale backdrop residuo
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      // 🔥 Rimuove classe di blocco scroll su body
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right'); // se Bootstrap aveva aggiunto padding
   document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    }
  }

  checkAndCreatePlan() {
    if (!this.newPlanName.trim()) {
      alert('Inserisci un nome valido per il nuovo piano.');
      return;
    }

    // Chiude il primo modale prima di eventuali altri step
    this.toggleModal('createPlanModal', 'hide');

    // Recupera i piani esistenti
    this.pazienteService
      .getPatientTreatmentPlansByPatientId(this.pazienteId!)
      .subscribe((piani) => {
        if (!piani || piani.length === 0) {
          this.createPlan();
          return;
        }
        console.log('PIANO ATTIVO RESULT: ' + this.pianoAttivo);
        // Se esiste almeno un piano attivo, apriamo il modale di conferma disattivazione
        if (this.pianoAttivo === true) {
          this.toggleModal('confirmDeactivateModal', 'show');
          console.log('DOPO IL =TRUE SIAMO QUI: ' + this.pianoAttivo);
        } else {
          this.createPlan();
        }
      });
  }

  // Disattiva il piano attivo e crea il nuovo piano
  deactivateAndCreatePlan() {
    // Chiude il modale di conferma prima di procedere
    this.toggleModal('confirmDeactivateModal', 'hide');
    // Recupera tutti i piani attivi e li disattiva
    this.pazienteService
      .getPatientTreatmentPlansByPatientId(this.pazienteId!)
      .subscribe((piani) => {
        if (!piani || piani.length === 0) {
          this.createPlan();
          return;
        }
        // Disattiva tutti i piani attivi
        const pianiAttivi = piani.filter((piano) => piano.attivo);

        const disattivazioni = pianiAttivi.map((piano) =>
          this.pazienteService.deactivatePlan(piano.id)
        );

        // Aspettiamo che tutti i piani siano disattivati prima di creare il nuovo
        forkJoin(disattivazioni).subscribe(() => {
          console.log('Tutti i piani precedenti sono stati disattivati.');
          this.createPlan();
        });
      });
  }
  // Crea il nuovo piano
  createPlan() {
    const nuovoPiano = {
      nomePiano: this.newPlanName,
      attivo: true,
      pazienteId: this.pazienteId,
    };

    this.pazienteService
      .creaPianoTrattamento(nuovoPiano)
      .pipe(
        switchMap(() => {
          // Dopo la creazione, fetch dei piani aggiornati
          return this.pazienteService.getPatientTreatmentPlansByPatientId(
            this.pazienteId!
          );
        })
      )
      .subscribe({
        next: (updatedPlans) => {
          this.treatmentPlans = updatedPlans;
          this.newPlanName = '';
          this.trattamentoSelezionato =
            updatedPlans.find((p) => p.attivo) || null;
          this.pianoAttivo = !!this.trattamentoSelezionato;

          // Chiude i modali
          this.toggleModal('createPlanModal', 'hide');
          this.toggleModal('confirmDeactivateModal', 'hide');

          // Mostra toast
          this.toastR.success('Piano creato con successo.', 'Successo', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            progressBar: true,
            closeButton: true,
          });

          // Applica i filtri
          this.applyAppointmentsFilters();
          this.applyEventsFilters();
        },
        error: (error) => {
          console.error('Errore nella creazione o nel fetch:', error);
          this.toastR.error('Errore nella creazione del piano', 'Errore');
        },
      });
  }
}
  

