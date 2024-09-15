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
import { PazienteService } from '../paziente.service';

@Component({
  selector: 'app-modifica-paziente',
  templateUrl: './modifica-paziente.component.html',
  styleUrls: ['./modifica-paziente.component.css'],
})
export class ModificaPazienteComponent implements OnInit {
  id: number | undefined;
  editMode = false; //per capire se sto creando o modificando
  formPaziente: FormGroup = new FormGroup({}); //reactive form

  constructor(
    private route: ActivatedRoute,
    private pazienteService: PazienteService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null; //se ha un id allora siamo in editMode
      console.log('EDIT MODE==' + this.editMode);
      this.initForm(); //LO CHIAMIAMO QUA PERCHE VUOL DIRE RICARICARE PAGINA CON NgonInit
    });
  }

  onSubmit() {
    if (this.editMode) {
      this.pazienteService.updatePaziente(this.id!, this.formPaziente.value);
    } else {
      this.pazienteService.addPaziente(this.formPaziente.value);
    }
    this.onCancel(); //navigo via una volta fatto
  }

  private initForm() {
    //inizializzo il form
    let nomePaziente = '';
    let cognomePaziente = '';
    let codiceFiscalePaziente = '';
    let dataDiNascitaPaziente: Date = new Date(); //questo deve diventare menu a tendina con scelta da array di Categoria[]
    let sessoPaziente = '';
    let indirizzoPaziente = ''; //questo deve diventare menu a tendina con scelta da array di Dentista[]
    let numeroDiCellularePaziente = ''; //questo deve diventare menu a tendina con scelta stato
    let dentistaIdPaziente = ''; //ID paziente associato

    if (this.editMode) {
      this.pazienteService.getPaziente(this.id!).subscribe((paziente) => {
        nomePaziente = paziente.nome || '';
        cognomePaziente = paziente.cognome || '';
        codiceFiscalePaziente = paziente.codiceFiscale || '';
        // Conversione della data di nascita da stringa a oggetto Date
        dataDiNascitaPaziente = new Date(paziente.dataDiNascita);
        sessoPaziente = paziente.sesso || '';
        indirizzoPaziente = paziente.indirizzo || '';
        numeroDiCellularePaziente = paziente.numeroDiCellulare || '';
        dentistaIdPaziente = paziente.dentistaId || '';

        this.formPaziente = this.formBuilder.group({
          nome: [nomePaziente, Validators.required],
          cognome: [cognomePaziente, Validators.required],
          codiceFiscale: [
            codiceFiscalePaziente,
            Validators.required
            //,
            // Validators.pattern(
            //   '^[A-Z]{6}[0-9]{2}[A-EHLMPR-T][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
            // ),
          ],
          dataDiNascita: [dataDiNascitaPaziente, Validators.required],
          sesso: [sessoPaziente, Validators.required],
          indirizzo: [indirizzoPaziente, Validators.required],
          numeroDiCellulare: [numeroDiCellularePaziente, Validators.required],
          dentistaId: [dentistaIdPaziente, Validators.required],
        });
      });
    } else {
      this.formPaziente = this.formBuilder.group({
        nome: [nomePaziente, Validators.required],
        cognome: [cognomePaziente, Validators.required],
        codiceFiscale: [
          codiceFiscalePaziente,
          Validators.required
          //,
          // Validators.pattern(
          //   '^[A-Z]{6}[0-9]{2}[A-EHLMPR-T][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
          // ),
        ],
        dataDiNascita: [dataDiNascitaPaziente, Validators.required],
        sesso: [sessoPaziente, Validators.required],
        indirizzo: [indirizzoPaziente, Validators.required],
        numeroDiCellulare: [numeroDiCellularePaziente, Validators.required],
        dentistaId: [dentistaIdPaziente, Validators.required],
      });
    }
  }

  onCancel() {
    //se cancello in edit ritorno al detail page, se new mi porta in recipes page
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
