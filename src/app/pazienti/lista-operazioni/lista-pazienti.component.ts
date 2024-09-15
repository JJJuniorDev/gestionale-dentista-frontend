import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Paziente } from '../paziente.model';
import {  PazienteService } from '../paziente.service';

@Component({
  selector: 'app-lista-pazienti',
  templateUrl: './lista-pazienti.component.html',
  styleUrls: ['./lista-pazienti.component.css'],
})
export class ListaPazientiComponent implements OnInit, OnDestroy {
  pazienti: Paziente[] = [];
  subscription!: Subscription;

  constructor(
    private pazienteService: PazienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscription = this.pazienteService.pazientiChanged.subscribe(
      (pazienti: Paziente[]) => {
        //se abbiamo cambiato qualcosa riceviamo il nuovo array
        this.pazienti = pazienti; //assegno le nostre operazioni alle nuove ricevute
      }
    );
    // Sottoscrizione al metodo getOperazioni
    this.pazienteService
      .getPazienti()
      .subscribe((pazienti: Paziente[]) => {
        this.pazienti = pazienti;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onNewPatient() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
}
