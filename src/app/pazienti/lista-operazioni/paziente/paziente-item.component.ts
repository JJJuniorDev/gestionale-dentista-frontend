import { Component, EventEmitter, Input } from '@angular/core';
import { Paziente } from '../../paziente.model';
import { AppuntamentoService } from 'src/app/appuntamenti/appuntamento.service';
import { AppuntamentoDTO } from 'src/app/appuntamenti/appuntamentoDTO.model';
import { Router } from '@angular/router';

import { PazienteService } from '../../paziente.service';

@Component({
  selector: 'app-paziente-item',
  templateUrl: './paziente-item.component.html',
  styleUrls: ['./paziente-item.component.css'],
})
export class PazienteItemComponent {
  // @ts-ignore
  @Input() paziente: Paziente;
  @Input() appuntamentiIds!: string[]; // Accetta gli appuntamentiIds come input
  // @ts-ignore
  @Input() index: number;

  appuntamenti: AppuntamentoDTO[] = [];

  constructor(
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private pazienteService: PazienteService
  ) {}

  ngOnInit() {}
  getCorrelatedAppointments() {
    const appuntamentiIds = this.paziente.appuntamentiIds; // Usa il campo del paziente
    console.log(
      'APP IDS IN PAZIENTE ITEM.TS PRIMA DEL REDIRECT: ' + appuntamentiIds
    );
    this.router.navigate(['/patientAppointments', this.paziente.id], {
      state: { appuntamentiIds }, // Passa gli ID degli appuntamenti come stato
    });
  }

  onViewDetailsPaziente() {
    console.log('indice app a cui navigare---->' + this.index);
    this.router.navigate(['/paziente', this.index]);
  }

  getCorrelatedTreatmentPlans() {
    let pazienteId = this.paziente.id;
    this.router.navigate(['/pazienti/patientTreatmentPlans', this.paziente.id]);
  }

  getPatientMedicalHistory() {
    this.router.navigate(['/pazienti/medical-history', this.paziente.id]);
  }

  onSelectPaziente(id: string) {
    //  this.viewDetails.emit(); // Emesso l'evento quando un appuntamento viene selezionato
    this.router.navigate(['/pazienti', id]);
  }
}
