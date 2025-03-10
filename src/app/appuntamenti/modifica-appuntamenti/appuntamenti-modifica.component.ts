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
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ottieni gli appuntamenti passati attraverso lo stato del router
    const navigazioneState = history.state;
    this.appuntamenti = navigazioneState ? navigazioneState.appuntamenti : [];
    // Abbonati a user$ per ottenere l'ID dell'utente loggato
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
    let dataAppuntamento: Date = new Date();
    let trattamentoAppuntamento = '';
    let noteAppuntamento = '';
    let codiceFiscalePaziente = '';
    let dottoreId = this.dottoreId;
    let pazienteId = '';
    let stato = 'futuro';
    let orario = '';

    this.formAppuntamento = this.formBuilder.group({
      data: [dataAppuntamento, Validators.required],
      orario: [orario, Validators.required], // Nuovo campo per l'orario
      note: [noteAppuntamento, Validators.required],
      trattamento: [trattamentoAppuntamento, Validators.required],
      codiceFiscalePaziente: [
        { value: codiceFiscalePaziente },
        Validators.required,
      ], // Campo disabilitato
      dottoreId: dottoreId,
      pazienteId: [pazienteId, Validators.required],
      stato: [stato, Validators.required],
    });
    this.generaOrariDisponibili(); // Genera gli orari disponibili
    if (this.editMode) {
      this.appuntamentoService
        .getAppuntamento(this.id!)
        .subscribe((appuntamento) => {
          this.formAppuntamento.patchValue({
            data: appuntamento.dataEOrario,
            orario: `${appuntamento.dataEOrario.getHours()}:${
              appuntamento.dataEOrario.getMinutes() === 0 ? '00' : '30'
            }`,
            trattamento: appuntamento.trattamento,
            note: appuntamento.note,
            codiceFiscalePaziente: appuntamento.codiceFiscalePaziente,
            dottoreId: appuntamento.paziente!.dottoreId,
            pazienteId: appuntamento.pazienteId,
            stato: appuntamento.stato,
          });
        });
    }
    this.formAppuntamento.updateValueAndValidity();
    console.log('Form valid?', this.formAppuntamento.valid);
  }

  onSubmit() {
   
    this.formAppuntamento.patchValue({ dottoreId: this.dottoreId });
    console.log('Dottore ID:', this.dottoreId);
    const pazienteId = this.getPazienteId(
      //prendo i dati del paziente in base al codice fiscale scelto
      this.formAppuntamento.value.codiceFiscalePaziente
    );
    if (!pazienteId) {
      return;
    }
    const dataSelezionata: Date = this.formAppuntamento.value.data;
     console.log('Data selezionata:', dataSelezionata.toISOString());
    if (!dataSelezionata) {
      console.error('Errore: Data non selezionata!');
      return;
    }
    // Prendi l'orario dal form
    const orarioSelezionato = this.formAppuntamento.value.orario;
    if (!orarioSelezionato) {
      console.error('Errore: Orario non selezionato!');
      return;
    }
    // Suddividi l'orario (es. "10:30") in ore e minuti
    const [ora, minuti] = orarioSelezionato.split(':').map(Number);

    dataSelezionata.setHours(ora, minuti, 0); // Imposta ora e minuti sulla data
    // Controlla che la data sia valida
    if (
      !(dataSelezionata instanceof Date) ||
      isNaN(dataSelezionata.getTime())
    ) {
      console.error('Errore: La data e orario selezionati non sono validi!');
      return;
    }
    // Controllo se l'orario è già occupato
    const appuntamentoEsistente = this.appuntamenti.find(
      (app) => new Date(app.dataEOrario).getTime() === dataSelezionata.getTime()
    );

    if (appuntamentoEsistente) {
      alert('Errore: Esiste già un appuntamento a questa data e ora!');
      return;
    }
    const formData = {
      ...this.formAppuntamento.value,
      dataEOrario: dataSelezionata.toISOString(), // Ora `dataEOrario` esiste e non sarà undefined
      pazienteId: pazienteId, // Solo l'ID del paziente
      codiceFiscalePaziente: this.formAppuntamento.value.codiceFiscalePaziente,
      dottoreId: this.dottoreId,
    };

    console.log('Form Data:', formData);

    if (this.editMode && this.id) {
      console.log('SIAMO IN UPDATE APPUNTAMENTO');
      this.appuntamentoService.updateAppuntamento(this.id, formData);
    } else {
      console.log('SIAMO IN ADD APPUNTAMENTO');
      // const pazienteId = selectedPaziente.id; // Prendiamo l'ID del paziente
      //   this.appuntamentoService.addAppuntamento(formData, pazienteId);
      this.appuntamentoService.addAppuntamento(formData, pazienteId, this.dottoreId!);
    }

    this.onCancel();
    // this.router.navigate(['/dashboard']); // Ricarica la lista
  }

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
