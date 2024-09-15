import { Component, OnInit } from '@angular/core';
import {
  Form,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OperazioneService } from '../operazioni.service';
import { Operazione } from '../operazione.model';
import { Materiale } from 'src/app/shared/materiale.module';

@Component({
  selector: 'app-operazioni-modifica',
  templateUrl: './operazioni-modifica.component.html',
  styleUrls: ['./operazioni-modifica.component.css'],
})
export class OperazioniModificaComponent implements OnInit {
  id: string | undefined;
  editMode = false; //per capire se sto creando o modificando
  formOperazione: FormGroup= new FormGroup({}); //reactive form

  constructor(
    private route: ActivatedRoute,
    private operazioneService: OperazioneService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null; //se ha un id allora siamo in editMode
      console.log('EDIT MODE==' + this.editMode);
      this.initForm(); //LO CHIAMIAMO QUA PERCHE VUOL DIRE RICARICARE PAGINA CON NgonInit
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.operazioneService.updateOperazione(
        this.id!,
        this.formOperazione.value
      );
    } else {
      this.operazioneService.addOperazione(this.formOperazione.value);
    }
    this.onCancel(); //navigo via una volta fatto
  }

  onAddMaterial() {
    //aggiungo al formarray un formgroup, ovvero un materiale
    (
      (<FormArray>this.formOperazione.get('materialiNecessari')) as FormArray
    ).push(
      new FormGroup({
        //valori di default, e requisiti per aggiungere
        name: new FormControl(null, [Validators.required]),
        amount: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/),
        ]),
      })
    );
  }

  onDeleteMaterial(index: number) {
    (
      (<FormArray>this.formOperazione.get('materialiNecessari')) as FormArray
    ).removeAt(index);
  }

  private initForm() {
    //inizializzo il form
    let nomeOperazione = '';
    let noteOperazione = '';
    let prezzoOperazione= 0;
    let categoriaOperazione= ''; //questo deve diventare menu a tendina con scelta da array di Categoria[]
    let durataOperazione= 0;
    let responsabileOperazione= ''; //questo deve diventare menu a tendina con scelta da array di Dentista[]
    let dataOperazione: Date= new Date();
    let statoOperazione= ''; //questo deve diventare menu a tendina con scelta stato
    let pazienteIdOperazione= 0; //ID paziente associato
    let materialiOperazione = new FormArray<FormGroup>([]);
    if (this.editMode) {
      this.operazioneService.getOperazione(this.id!).subscribe((operazione) => {
        nomeOperazione = operazione.nome;
        noteOperazione = operazione.note || '';
        prezzoOperazione = operazione.prezzo;
        categoriaOperazione = operazione.categoria || '';
        durataOperazione = operazione.durata || 0;
        responsabileOperazione = operazione.responsabile;
        dataOperazione = operazione.data;
        statoOperazione = operazione.stato || '';
        pazienteIdOperazione = operazione.pazienteId;
        if (operazione.materialiNecessari) {
          for (let materiale of operazione.materialiNecessari) {
            materialiOperazione.push(
              new FormGroup({
                name: new FormControl(materiale.name, Validators.required),
                amount: new FormControl(materiale.amount, [
                  Validators.required,
                  Validators.pattern(/^[1-9]+[0-9]*$/),
                ]),
              })
            );
          }
        }
        // Se non ci sono materiali necessari, aggiungiamo un materiale vuoto di default
        if (
          !operazione.materialiNecessari ||
          operazione.materialiNecessari.length === 0
        ) {
          materialiOperazione.push(
            new FormGroup({
              name: new FormControl(null, Validators.required),
              amount: new FormControl(null, [
                Validators.required,
                Validators.pattern(/^[1-9]+[0-9]*$/),
              ]),
            })
          );
        }
        this.formOperazione = this.formBuilder.group({
          nome: [nomeOperazione, Validators.required],
          note: [noteOperazione, Validators.required],
          prezzo: [
            prezzoOperazione,
            [
              Validators.required,
              Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
            ],
          ],
          categoria: [categoriaOperazione, Validators.required],
          durata: [
            durataOperazione,
            [Validators.required, Validators.pattern(/^[0-9]+$/)],
          ],
          responsabile: [responsabileOperazione, Validators.required],
          data: [dataOperazione, Validators.required],
          stato: [statoOperazione, Validators.required],
          pazienteId: [
            pazienteIdOperazione,
            [Validators.required, Validators.pattern(/^[0-9]+$/)],
          ],
          materialiNecessari: materialiOperazione,
        });
      });
    } else {
      this.formOperazione = this.formBuilder.group({
        nome: [nomeOperazione, Validators.required],
        note: [noteOperazione, Validators.required],
        prezzo: [
          prezzoOperazione,
          [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
        ],
        categoria: [categoriaOperazione, Validators.required],
        durata: [
          durataOperazione,
          [Validators.required, Validators.pattern(/^[0-9]+$/)],
        ],
        responsabile: [responsabileOperazione, Validators.required],
        data: [dataOperazione, Validators.required],
        stato: [statoOperazione, Validators.required],
        pazienteId: [
          pazienteIdOperazione,
          [Validators.required, Validators.pattern(/^[0-9]+$/)],
        ],
        materialiNecessari: materialiOperazione,
      });
    }
  }


  get controls() {
    // a getter!
    return (<FormArray>this.formOperazione.get('materialiNecessari')).controls;
  }

  onCancel() {
    //se cancello in edit ritorno al detail page, se new mi porta in recipes page
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
