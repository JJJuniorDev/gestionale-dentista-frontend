import { Component, EventEmitter, Input } from '@angular/core';
import { Appuntamento } from '../../appuntamento.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-appuntamento-item',
  templateUrl: './appuntamento-item.component.html',
  styleUrls: ['./appuntamento-item.component.css'],
})
export class ItemAppuntamentoComponent {
  // @ts-ignore
  @Input() appuntamento: Appuntamento;

  // @ts-ignore
  @Input() index: string;
  //gli passo l'indice dell'item da list-operazione-component.html

  constructor(private router: Router) {}

  ngOnInit() {}

  onViewDetails() {
    this.router.navigate(['/dettagli-appuntamento', this.index]);
  }
}
