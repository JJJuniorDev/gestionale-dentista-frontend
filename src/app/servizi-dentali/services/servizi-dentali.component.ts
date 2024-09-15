import { Component } from '@angular/core';
import { ServizioDentale } from '../servizio-dentale.model';
import { ServiziDentaliService } from '../serviziDentali.service';

@Component({
  selector: 'app-servizi-dentali',
  templateUrl: './servizi-dentali.component.html',
  styleUrls: ['./servizi-dentali.component.css'],
})
export class ServiziDentaliComponent {
  servizi: ServizioDentale[] = [];

  constructor(private serviziDentaliService: ServiziDentaliService) {}

  ngOnInit(): void {
    this.serviziDentaliService.getServiziDentali().subscribe(
      (data: ServizioDentale[]) => {
        this.servizi = data;
      },
      (error) => {
        console.error('Errore nel caricamento dei servizi dentali', error);
      }
    );
  }
}
