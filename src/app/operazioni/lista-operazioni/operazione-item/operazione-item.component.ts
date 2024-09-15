import { Component, EventEmitter, Input } from '@angular/core';
import { Operazione } from '../../operazione.model';

@Component({
  selector: 'app-operazione-item',
  templateUrl: './operazione-item.component.html',
  styleUrls: ['./operazione-item.component.css'],
})
export class ItemOperazioneComponent {
  // @ts-ignore
  @Input() operazione: Operazione;

  // @ts-ignore
  @Input() index: number;
  //gli passo l'indice dell'item da list-operazione-component.html

  constructor() {}

  ngOnInit() {}
}
