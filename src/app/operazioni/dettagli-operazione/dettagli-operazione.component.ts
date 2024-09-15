import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Operazione } from '../operazione.model';
import { OperazioneService } from '../operazioni.service';

@Component({
  selector: 'app-dettagli-operazione',
  templateUrl: './dettagli-operazione.component.html',
  styleUrls: ['./dettagli-operazione.component.css'],
})
export class DettagliOperazioneComponent implements OnInit {
  operazione!: Operazione;
  id!: string;

  constructor(
    private operazioneService: OperazioneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
  this.operazioneService.getOperazione(this.id).subscribe((operazione: Operazione) =>{
   this.operazione=operazione;
  })  
  });
  }
  
  onOperazioneEdit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    //  this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  onDeleteOperazione() {
    this.operazioneService.deleteOperazione(this.id);
    // this.router.navigate['/recipes'];
  }
}
