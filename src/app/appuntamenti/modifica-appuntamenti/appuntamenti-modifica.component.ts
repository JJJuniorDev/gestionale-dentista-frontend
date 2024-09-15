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
import { Appuntamento } from '../appuntamento.model';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-appuntamenti-modifica',
  templateUrl: './appuntamenti-modifica.component.html',
  styleUrls: ['./appuntamenti-modifica.component.css'],
})
export class AppuntamentiModificaComponent implements OnInit {
  id: string | undefined;
  editMode = false; //per capire se sto creando o modificando
  formAppuntamento: FormGroup = new FormGroup({}); //reactive form
  appuntamenti: Appuntamento[] = [];
  bsConfig: Partial<BsDatepickerConfig> = {
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD/MM/YYYY',
    showWeekNumbers: false,
    // altre configurazioni
  };
  
  constructor(
    private route: ActivatedRoute,
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null; //se ha un id allora siamo in editMode
      console.log('EDIT MODE==' + this.editMode);
      this.initForm(); //LO CHIAMIAMO QUA PERCHE VUOL DIRE RICARICARE PAGINA CON NgonInit
    });
  }

  loadAppuntamenti() {
    this.appuntamentoService
      .getAppuntamenti()
      .subscribe((data: Appuntamento[]) => {
        this.appuntamenti = data;
      });
  }

  onSubmit() {
    if (this.editMode && this.id) {
      const formData = {
        ...this.formAppuntamento.value,
        dataEOrario: this.formAppuntamento.value.dataEOrario.toISOString(), // Formatta la data
      };
      this.appuntamentoService.updateAppuntamento(this.id, formData);
    } else {
      this.appuntamentoService.addAppuntamento(this.formAppuntamento.value);
    }
    this.onCancel(); //navigo via una volta fatto
    this.router.navigate(['/dashboard']); // Ricarica la lista
  }

  onAddOperazione() {
    (this.formAppuntamento.get('operazioni') as FormArray).push(
      new FormGroup({
        descrizione: new FormControl(null, Validators.required),
        costo: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/),
        ]),
      })
    );
  }

  private initForm() {
    //inizializzo il form
    let dataEOrarioAppuntamento: Date = new Date();
    let trattamentoAppuntamento = '';
    let noteAppuntamento = '';
    let codiceFiscalePaziente = '';
    let appuntamentoOperazioni = new FormArray([]);

    this.formAppuntamento = this.formBuilder.group({
      dataEOrario: [dataEOrarioAppuntamento, Validators.required],
      note: [noteAppuntamento, Validators.required],
      trattamento: [trattamentoAppuntamento, Validators.required],
      codiceFiscalePaziente: [codiceFiscalePaziente, Validators.required],
      operazioni: appuntamentoOperazioni,
    });

    if (this.editMode) {
      this.appuntamentoService
        .getAppuntamento(this.id!)
        .subscribe((appuntamento) => {
          this.formAppuntamento.patchValue({
            dataEOrario: appuntamento.dataEOrario,
            trattamento: appuntamento.trattamento,
            note: appuntamento.note,
            codiceFiscalePaziente: appuntamento.codiceFiscalePaziente,
          });

          // if (appuntamento.operazioni) {
          //   for (let operazione of appuntamento.operazioni) {
          //     appuntamentoOperazioni.push(
          //       new FormGroup({
          //         categoria: new FormControl(
          //           operazione.categoria,
          //           Validators.required
          //         ),
          //         prezzo: new FormControl(operazione.prezzo, [
          //           Validators.required,
          //           Validators.pattern(/^[1-9]+[0-9]*$/),
          //         ]),
          //         responsabile: new FormControl(
          //           operazione.responsabile,
          //           Validators.required
          //         ),
          //       })
          //     );
          //   }
          // }
        });
    }
  }

  onCancel() {
    //se cancello in edit ritorno al detail page, se new mi porta in recipes page
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
