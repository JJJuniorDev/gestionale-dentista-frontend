import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { EventoService } from '../../evento.service';
import { EventoDTO } from '../../eventoDTO.model';
import { PazienteService } from 'src/app/pazienti/paziente.service';
import { AuthService } from 'src/app/auth/auth.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Paziente } from 'src/app/pazienti/paziente.model';
import { map, Observable, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-eventi-modifica',
  templateUrl: './eventi-modifica.component.html',
  styleUrls: ['./eventi-modifica.component.css'],
})
export class EventiModificaComponent implements OnInit {
  id: string | null = null;
  editMode = false;
  formEvento: FormGroup = new FormGroup({});
  dottoreId: string | undefined;
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
  searchField: string = 'cf';
  orariDisponibili: string[] = [];

  constructor(
    private pazienteService: PazienteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private router: Router,
    private formBuilder: FormBuilder
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
      this.editMode = this.id != null;
      console.log("EDIT MODE: "+this.editMode);
      this.initForm();
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
    //   let dataEvento: Date = new Date();
    //   let descrizione = '';
    //   let tipologia = '';
    //   let orario = '';

    //  this.formEvento = this.formBuilder.group({
    //    dataEvento: [dataEvento, Validators.required],
    //    orario: [orario, Validators.required],
    //    descrizione: [descrizione],
    //    tipologia: [tipologia, Validators.required],
    //    codiceFiscalePaziente: [''],
    //  });
    //   this.generaOrariDisponibili();
    //   if (this.editMode) {
    //     this.eventoService.getEvento(this.id!).subscribe((evento) => {
    //       if (evento) {
    //         this.formEvento.patchValue({
    //           descrizione: evento.descrizione,
    //           dataEvento: evento.dataEOrario,
    //           orario: `${evento.dataEOrario.getHours()}:${
    //             evento.dataEOrario.getMinutes() === 0 ? '00' : '30'
    //           }`,
    //           tipologia: evento.tipologia,
    //         });
    //       }
    //     });
    //   }
    this.formEvento = this.formBuilder.group({
      dataEvento: [null, Validators.required],
      orario: ['', Validators.required],
      descrizione: [''],
      tipologia: ['', Validators.required],
      codiceFiscalePaziente: [''],
   
    });

    this.generaOrariDisponibili();

    if (this.editMode) {
      this.caricaEvento(); // Chiamiamo un nuovo metodo per caricare i dati
    }
  }

  caricaEvento() {
    if (!this.id) return; // Controllo di sicurezza

    this.eventoService.getEvento(this.id).subscribe((evento) => {
      if (evento) {
        const dataEOrario = new Date(evento.dataEOrario);
        this.formEvento.patchValue({
          descrizione: evento.descrizione || '',
          dataEvento: this.formattaData(dataEOrario), // Solo la data
          orario: this.formattaOrario(dataEOrario), // Solo l'orario
          tipologia: evento.tipologia || '',
          codiceFiscalePaziente: '',
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

  onSubmit() {
    if (this.formEvento.invalid) {
      console.error('Form non valido!');
      return;
    }
    // this.formEvento.patchValue({ dottoreId: this.dottoreId });
      let pazienteId: string | undefined;

      if (!this.editMode) {
        pazienteId = this.getPazienteId(
          this.formEvento.value.codiceFiscalePaziente
        );
        if (!pazienteId) {
          console.error('Errore: paziente non trovato!');
          return;
        }
      } else {
        pazienteId = this.formEvento.value.pazienteId; // Usa l'ID già presente in editMode
      }

    const dataSelezionata: Date = this.formEvento.value.dataEvento;
    const orarioSelezionato = this.formEvento.value.orario; // "HH:mm"
    //console.log('Data selezionata:', dataSelezionata.toISOString());
    if (!dataSelezionata || !orarioSelezionato) {
      console.error('Errore: Data o orario mancanti!');
      return;
    }

    // Suddividi l'orario (es. "10:30") in ore e minuti
    const [ora, minuti] = orarioSelezionato.split(':').map(Number);
    dataSelezionata.setHours(ora, minuti, 0); // Imposta ora e minuti sulla data
   // Creazione dell'oggetto data e impostazione dell'orario
    // const dataEOrario = new Date(
    //   `${dataSelezionata}T${orarioSelezionato}:00.000Z`
    // );
    console.log('Data selezionata:', this.formEvento.value.dataEvento);
    console.log('Orario selezionato:', this.formEvento.value.orario);
    const formData = {
      ...this.formEvento.value,
      dataEOrario: dataSelezionata.toISOString(),
      // dataEOrario: dataSelezionata.toISOString(), // Ora `dataEOrario` esiste e non sarà undefined
      pazienteId: pazienteId,
      dottoreId: this.dottoreId,
    };

        if (this.editMode) {
      // **MODIFICA EVENTO**
      this.eventoService.updateEvent(this.id!, formData).subscribe({
        next: () => {
          alert('Evento modificato con successo!');
          this.router.navigate([`/appuntamenti/dottore/${this.dottoreId}`]);
        },
        error: (err) => {
          console.error('Errore durante la modifica dell’evento:', err);
          alert('Errore durante la modifica dell’evento. Riprova.');
        },
      });
    } else {
    this.pazienteService
      .getPatientTreatmentPlansByPatientId(pazienteId!)
      .subscribe((piani) => {
        const pianoAttivo = piani.find((piano) => piano.attivo);

        if (!pianoAttivo) {
          alert(
            'Errore: Nessun piano di trattamento attivo trovato! Creane uno prima di aggiungere un evento.'
          );
          return;
        }
        this.pazienteService
          .addEventToPlan(pazienteId!, pianoAttivo.id, formData)
          .subscribe({
            next: () => {
              alert('Evento aggiunto con successo!');
              this.router.navigate([`/appuntamenti/dottore/${this.dottoreId}`]);
            },
            error: (err) => {
              console.error('Errore durante l’aggiunta dell’evento:', err);
              alert('Errore durante l’aggiunta dell’evento. Riprova.');
            },
          });
        });
      }
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

  onPazienteSelect(event: any) {
    const codiceFiscale = event.option.value;
    const selectedPaziente = this.pazienti.find(
      (paziente) => paziente.codiceFiscale === codiceFiscale
    );

    if (selectedPaziente) {
      console.log('Paziente selezionato: ', selectedPaziente);

      this.formEvento.patchValue({
        codiceFiscalePaziente: selectedPaziente.codiceFiscale,
        pazienteId: selectedPaziente.id, // Popoliamo anche l'ID del paziente
        dottoreId: selectedPaziente.dottoreId,
      });
      // **Forza il form a ricalcolare la validità**
      this.formEvento.updateValueAndValidity();
    }
  }

  onCancel() {
    this.router.navigate(['/eventi']);
  }

  private generaOrariDisponibili() {
    this.orariDisponibili = [];
    for (let ora = 8; ora <= 20; ora++) {
      this.orariDisponibili.push(`${ora}:00`, `${ora}:30`);
    }
  }
}
