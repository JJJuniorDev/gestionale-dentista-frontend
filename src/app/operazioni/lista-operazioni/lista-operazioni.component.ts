import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Operazione } from '../operazione.model';
import { OperazioneService } from '../operazioni.service';

@Component({
  selector: 'app-lista-operazioni',
  templateUrl: './lista-operazioni.component.html',
  styleUrls: ['./lista-operazioni.component.css'],
})
export class ListaOperazioniComponent implements OnInit, OnDestroy {
  operazioni: Operazione[] = [];
  subscription!: Subscription;

  constructor(
    private operazioneService: OperazioneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscription = this.operazioneService.operazioniChanged.subscribe(
      (operazioni: Operazione[]) => {
        //se abbiamo cambiato qualcosa riceviamo il nuovo array
        this.operazioni = operazioni; //assegno le nostre operazioni alle nuove ricevute
      }
    );
    // Sottoscrizione al metodo getOperazioni
    this.operazioneService
      .getOperazioni()
      .subscribe((operazioni: Operazione[]) => {
        this.operazioni = operazioni;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onNewOperation() {
    this.router.navigate(['new'], { relativeTo: this.route }); //siamo già in /recipes
  }
}
function ngOnInit() {
  throw new Error('Function not implemented.');
}

