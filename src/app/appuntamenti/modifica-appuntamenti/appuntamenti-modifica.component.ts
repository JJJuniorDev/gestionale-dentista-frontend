import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppuntamentoService } from '../appuntamento.service';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { AppuntamentoDTO } from '../appuntamentoDTO.model';
import { Paziente } from 'src/app/pazienti/paziente.model';
import { PazienteService } from 'src/app/pazienti/paziente.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-appuntamenti-modifica',
  templateUrl: './appuntamenti-modifica.component.html',
  styleUrls: ['./appuntamenti-modifica.component.css'],
})
export class AppuntamentiModificaComponent implements OnInit {
  id: string | undefined;
  editMode = false; //per capire se sto creando o modificando
  formAppuntamento: FormGroup = new FormGroup({}); //reactive form
  appuntamenti: AppuntamentoDTO[] = [];
  bsConfig: Partial<BsDatepickerConfig> = {
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD/MM/YYYY',
    showWeekNumbers: false,
    // altre configurazioni
  };
  pazienti: Paziente[] = [];
  subscription!: Subscription;
  pazienteFilterCtrl = new FormControl(); // Campo di ricerca
  filteredPazienti!: Observable<Paziente[]>; // Lista filtrata
  searchField: string = 'cf'; // Default: cerca per codice fiscale
  dottoreId: string | null = null;
  orariDisponibili: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private pazienteService: PazienteService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.dottoreId = user.id; // Ottieni l'ID dell'utente loggato
        console.log('ID Dottore: ', this.dottoreId);
      }
    });

    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null; //se ha un id allora siamo in editMode
      console.log('EDIT MODE==' + this.editMode);
      this.initForm(); //LO CHIAMIAMO QUA PERCHE VUOL DIRE RICARICARE PAGINA CON NgonInit
    });
    // Carica la lista dei pazienti
    this.subscription = this.pazienteService
      .getPazienti(this.authService.getUserId()!)
      .subscribe((pazienti: Paziente[]) => {
        this.pazienti = pazienti;
        // Imposta il filtro in tempo reale
        this.filteredPazienti = this.pazienteFilterCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filtraPazienti(value || ''))
        );
      });
  }

  // Funzione che filtra i pazienti in base all'input
  private filtraPazienti(value: string): Paziente[] {
    const filterValue = value.toLowerCase();
    return this.pazienti.filter((paziente) => {
      switch (this.searchField) {
        case 'cf':
          return paziente.codiceFiscale?.toLowerCase().includes(filterValue); // Usa optional chaining
        case 'nome':
          return paziente.nome?.toLowerCase().includes(filterValue); // Usa optional chaining
        case 'cognome':
          return paziente.cognome?.toLowerCase().includes(filterValue); // Usa optional chaining
        default:
          return paziente.codiceFiscale?.toLowerCase().includes(filterValue); // Usa optional chaining
      }
    });
  }

  private initForm() {
    //inizializzo il form
    // let dataAppuntamento: Date = new Date();
    // let trattamentoAppuntamento = '';
    // let noteAppuntamento = '';
    // let codiceFiscalePaziente = '';
    // let dottoreId = this.dottoreId;
    // let pazienteId = '';
    // let stato = 'futuro';
    // let orario = '';

    this.formAppuntamento = this.formBuilder.group({
      data: [null, Validators.required],
      orario: ['', Validators.required], // Nuovo campo per l'orario
      note: [''],
      trattamento: [''],
      codiceFiscalePaziente: [''], // Campo disabilitato
      stato: ['', Validators.required],
    });
    this.generaOrariDisponibili(); // Genera gli orari disponibili
    if (this.editMode) {
      this.caricaAppuntamento();
    }
  }

  caricaAppuntamento() {
    if (!this.id) return;

    this.appuntamentoService
      .getAppuntamento(this.id!)
      .subscribe((appuntamento) => {
        if (appuntamento) {
           const dataEOrario = new Date(appuntamento.dataEOrario);
          this.formAppuntamento.patchValue({
            data: this.formattaData(dataEOrario),
            orario: this.formattaOrario(dataEOrario),
            trattamento: appuntamento.trattamento || '',
            note: appuntamento.note || '',
            codiceFiscalePaziente: appuntamento.codiceFiscalePaziente || '',
            stato: appuntamento.stato || '',
          });
        }
      });
  }

  private formattaData(data: Date): string {
    return data.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  private formattaOrario(data: Date): string {
    return `${data.getHours()}:${data.getMinutes() === 0 ? '00' : '30'}`;
  }

  async onSubmit() {
     if (this.formAppuntamento.invalid) {
       console.error('Form non valido!');
       return;
     }

         let pazienteId: string | undefined;

         if (!this.editMode) {
           pazienteId = this.getPazienteId(
             this.formAppuntamento.value.codiceFiscalePaziente
           );
           if (!pazienteId) {
             console.error('Errore: paziente non trovato!');
             return;
           }
         } else {
           pazienteId = this.formAppuntamento.value.pazienteId; // Usa l'ID già presente in editMode
         }

    this.formAppuntamento.patchValue({ dottoreId: this.dottoreId });
    console.log('Dottore ID:', this.dottoreId);
  
    const dataSelezionata: Date = this.formAppuntamento.value.data;
     const orarioSelezionato = this.formAppuntamento.value.orario;
    if (!dataSelezionata || !orarioSelezionato) {
      console.error('Errore: Data o orario mancanti!');
      return;
    }
    // Suddividi l'orario (es. "10:30") in ore e minuti
    const [ora, minuti] = orarioSelezionato.split(':').map(Number);
    dataSelezionata.setHours(ora, minuti, 0); // Imposta ora e minuti sulla data
    // Controlla che la data sia valida
  
    // Controllo se l'orario è già occupato
   
    const formData = {
      ...this.formAppuntamento.value,
      dataEOrario: dataSelezionata.toISOString(), // Ora `dataEOrario` esiste e non sarà undefined
      pazienteId: pazienteId, // Solo l'ID del paziente
      codiceFiscalePaziente: this.formAppuntamento.value.codiceFiscalePaziente,
      dottoreId: this.dottoreId,
    };

    console.log('Form Data:', formData);

    if (this.editMode) {
      console.log('SIAMO IN UPDATE APPUNTAMENTO');
      this.appuntamentoService
        .updateAppuntamento(this.id!, formData)
        .subscribe({
          next: () => {
            this.toastr.success(
              'Appuntamento modificato con successo',
              'Successo',
              {
                timeOut: 3000, // Durata del messaggio
                positionClass: 'toast-top-center', // Posizione del toast al centro in alto
                progressBar: true, // Aggiungi una barra di progresso
                closeButton: true, // Aggiungi un pulsante di chiusura
              }
            );
            this.router.navigate([`/appuntamenti/dottore/${this.dottoreId}`]);
          },
          error: (err) => {
            console.error('Errore durante la modifica dell’evento:', err);
             this.toastr.error(
               'Errore durante la modifica dell’evento, riprovare.',
               'Errore',
               {
                 timeOut: 3000, // Durata del messaggio
                 positionClass: 'toast-top-center', // Posizione del toast al centro in alto
                 progressBar: true, // Aggiungi una barra di progresso
                 closeButton: true, // Aggiungi un pulsante di chiusura
               }
             );
          },
        });
    } else {
       // 1. Create appointment (await the Promise)
  const nuovoAppuntamento = await this.appuntamentoService.addAppuntamento(formData, pazienteId!, this.dottoreId!);
  
  // 2. After appointment is created, get treatment plans
  const piani = await this.pazienteService.getPatientTreatmentPlansByPatientId(pazienteId!).toPromise();
  
  const pianoAttivo = piani?.find((piano) => piano.attivo);
              if (!pianoAttivo) {
                this.toastr.warning(
                  'Nessun piano attivo: appuntamento creato ma non aggiunto al piano.',
                  'Attenzione',
                  {
                    timeOut: 3000, // Durata del messaggio
                    positionClass: 'toast-top-center', // Posizione del toast al centro in alto
                    progressBar: true, // Aggiungi una barra di progresso
                    closeButton: true, // Aggiungi un pulsante di chiusura
                  }
                );
                // 🔁 Redireziona comunque alla lista appuntamenti
                this.router.navigate([
                  `/appuntamenti/dottore/${this.dottoreId}`,
                ]);
                return; // ❗ Interrompi il flusso per evitare errori sul pianoAttivo null
              }
              
            // 3. Add appointment to treatment plan
  await this.pazienteService.addAppointmentToPlan(
    pazienteId!,
    pianoAttivo!.id,
    nuovoAppuntamento.id // Pass just the ID string
  ).toPromise();
             this.toastr.success(
               'Appuntamento creato e aggiunto al piano di trattamento con successo!',
               'Successo',
               {
                 timeOut: 3000, // Durata del messaggio
                 positionClass: 'toast-top-center', // Posizione del toast al centro in alto
                 progressBar: true, // Aggiungi una barra di progresso
                 closeButton: true, // Aggiungi un pulsante di chiusura
               }
             );
                  this.router.navigate([`/appuntamenti/dottore/${this.dottoreId}`]);
                }
                error: (err: any) => {
                  console.error('Errore durante l aggiunta al piano di trattamento:', err);
                 this.toastr.error(
                   "Appuntamento creato, ma errore nell'aggiunta al piano di trattamento.",
                   'Errore',
                   {
                     timeOut: 3000, // Durata del messaggio
                     positionClass: 'toast-top-center', // Posizione del toast al centro in alto
                     progressBar: true, // Aggiungi una barra di progresso
                     closeButton: true, // Aggiungi un pulsante di chiusura
                   }
                 );
  }
}

    // this.router.navigate(['/dashboard']); // Ricarica la lista

  // Metodo che gestisce la selezione del paziente
  onPazienteSelect(event: any) {
    const codiceFiscale = event.option.value;
    const selectedPaziente = this.pazienti.find(
      (paziente) => paziente.codiceFiscale === codiceFiscale
    );

    if (selectedPaziente) {
      console.log('Paziente selezionato: ', selectedPaziente);

      this.formAppuntamento.patchValue({
        codiceFiscalePaziente: selectedPaziente.codiceFiscale,
        pazienteId: selectedPaziente.id, // Popoliamo anche l'ID del paziente
        dottoreId: selectedPaziente.dottoreId,
      });
      // **Forza il form a ricalcolare la validità**
      this.formAppuntamento.updateValueAndValidity();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadAppuntamenti() {
    this.appuntamentoService
      .getAppuntamenti()
      .subscribe((data: AppuntamentoDTO[]) => {
        this.appuntamenti = data;
      });
  }

  getPazienteId(codiceFiscale: string): string | undefined {
    // Cerca il paziente nell'array dei pazienti usando il codice fiscale
    const paziente = this.pazienti.find(
      (p) => p.codiceFiscale === codiceFiscale
    );
    console.log('PAZIENTE: ' + paziente?.id);
    if (!paziente) {
      console.error(
        'Nessun paziente trovato per il codice fiscale:',
        codiceFiscale
      );
    }
    // Ritorna l'ID del paziente come stringa, se trovato
    return paziente ? paziente.id.toString() : undefined;
  }

  onCancel() {
    //se cancello in edit ritorno al detail page, se new mi porta in recipes page
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private generaOrariDisponibili() {
    this.orariDisponibili = [];
    for (let ora = 8; ora <= 20; ora++) {
      this.orariDisponibili.push(`${ora}:00`, `${ora}:30`);
    }
  }
}
