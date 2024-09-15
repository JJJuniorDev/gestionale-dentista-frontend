import { Component, EventEmitter, Input } from '@angular/core';
import { Paziente } from '../../paziente.model';

@Component({
  selector: 'app-paziente-item',
  templateUrl: './paziente-item.component.html',
  styleUrls: ['./paziente-item.component.css'],
})
export class PazienteItemComponent {
  // @ts-ignore
  @Input() paziente: Paziente;

  // @ts-ignore
  @Input() index: number;
  //gli passo l'indice dell'item da list-operazione-component.html

  constructor() {}

  ngOnInit() {}
}
