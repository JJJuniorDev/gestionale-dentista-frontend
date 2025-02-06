import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PazienteService } from '../paziente.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-modifica-paziente',
  templateUrl: './modifica-paziente.component.html',
  styleUrls: ['./modifica-paziente.component.css'],
})
export class ModificaPazienteComponent implements OnInit {
  id: string | undefined;
  editMode = false;
  formPaziente!: FormGroup;
  dottoreId: string | null = null;
  stato: string = 'ATTIVO';

  constructor(
    private route: ActivatedRoute,
    private pazienteService: PazienteService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null;
      console.log('EDIT MODE == ' + this.editMode);
      console.log('PARAMETRI ==', JSON.stringify(params));

      this.authService.user$.subscribe((user) => {
        if (user) {
          this.dottoreId = user.id;
        }
      });

      this.initForm();
    });
  }

  onSubmit() {
    if (this.formPaziente.invalid) {
      return; // Blocca il salvataggio se il form non è valido
    }

    const pazienteFormValue = { ...this.formPaziente.value };

    if (this.editMode) {
      this.pazienteService.updatePaziente(this.id!, pazienteFormValue);
    } else {
      console.log(
        'VALORE FORM JSON:',
        JSON.stringify(this.formPaziente.value, null, 2)
      );
      this.pazienteService.addPaziente(pazienteFormValue);
    }

    this.onCancel();
  }

  private initForm() {
    let nome = '';
    let cognome = '';
    let codiceFiscale = '';
    let dataDiNascita: Date | null = null;
    let sesso = '';
    let indirizzo = '';
    let numeroDiCellulare = '';
    let dottoreId = this.dottoreId;
    let stato = this.stato;

    this.formPaziente = this.formBuilder.group({
      nome: [nome, Validators.required],
      cognome: [cognome, Validators.required],
      codiceFiscale: [
        codiceFiscale,
        [
          Validators.required,
          Validators.pattern(
            '^[A-Z]{6}[0-9]{2}[A-EHLMPR-T][0-9]{2}[A-Z][0-9]{3}[A-Z]$'
          ),
        ],
      ],
      dataDiNascita: [
        dataDiNascita,
        [Validators.required, this.dataDiNascitaValidator],
      ],
      sesso: [sesso, Validators.required],
      indirizzo: [indirizzo, Validators.required],
      numeroDiCellulare: [
        numeroDiCellulare,
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      dottoreId: [dottoreId, Validators.required],
      stato: [stato],
    });

    if (this.editMode) {
      this.pazienteService.getPaziente(this.id!).subscribe((paziente) => {
        this.formPaziente.patchValue({
          nome: paziente.nome,
          cognome: paziente.cognome,
          codiceFiscale: paziente.codiceFiscale,
          dataDiNascita: new Date(paziente.dataDiNascita),
          sesso: paziente.sesso,
          indirizzo: paziente.indirizzo,
          numeroDiCellulare: paziente.numeroDiCellulare,
          dottoreId: paziente.dottoreId,
          stato: this.stato,
        });
      });
    }
  }

  dataDiNascitaValidator(control: any) {
    const inputDate = new Date(control.value);
    const today = new Date();
    return inputDate > today ? { futureDate: true } : null;
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
