import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Paziente } from '../paziente.model';
import { PazienteService } from '../paziente.service';

@Component({
  selector: 'app-dettagli-paziente',
  templateUrl: './dettagli-paziente.component.html',
  styleUrls: ['./dettagli-paziente.component.css'],
})
export class DettagliPazienteComponent implements OnInit {
  paziente!: Paziente;
  id!: number;

  constructor(
    private pazienteService: PazienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.pazienteService
        .getPaziente(this.id)
        .subscribe((paziente: Paziente) => {
          this.paziente = paziente;
        });
    });
  }

  onPazienteEdit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    //  this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  onDeletePaziente() {
    this.pazienteService.deletePaziente(this.id);
    // this.router.navigate['/recipes'];
  }
}
