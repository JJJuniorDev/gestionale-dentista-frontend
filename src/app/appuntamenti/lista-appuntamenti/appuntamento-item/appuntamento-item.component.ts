import { Component, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AppuntamentoDTO } from '../../appuntamentoDTO.model';


@Component({
  selector: 'app-appuntamento-item',
  templateUrl: './appuntamento-item.component.html',
  styleUrls: ['./appuntamento-item.component.css'],
})
export class ItemAppuntamentoComponent {
  // @ts-ignore
  @Input() appuntamento: AppuntamentoDTO;

  // @ts-ignore
  @Input() index: string;
  //gli passo l'indice dell'item da list-operazione-component.html

  constructor(private router: Router) {}

  ngOnInit() {}

  onViewDetails() {
    console.log("indice app a cui navigare---->"+this.index);
    this.router.navigate(['/appuntamenti', this.index]);
  }

  // onViewFatturazione(){
  //   console.log('Navigo verso fatturazione con index: ', this.index);
  //   this.router.navigate(['/appuntamenti/fatturazione', this.index]);
  // }
}
