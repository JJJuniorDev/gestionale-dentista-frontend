import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Paziente } from '../paziente.model';
import { PazienteService } from '../paziente.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/app/modali/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-dettagli-paziente',
  templateUrl: './dettagli-paziente.component.html',
  styleUrls: ['./dettagli-paziente.component.css'],
})
export class DettagliPazienteComponent implements OnInit {
  paziente!: Paziente;
  id!: string;

  constructor(
    private pazienteService: PazienteService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
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
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      panelClass: 'custom-confirmation-modal', // Classe personalizzata
      data: {
        cf: this.paziente?.codiceFiscale,
        data: this.paziente?.dataDiNascita,
      }, // Passa i dati al modale
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.id) {
          this.pazienteService.deletePaziente(this.id).subscribe(() => {
            this.router.navigate([`/pazienti`]);
          });
        }
      } else {
        console.log('Eliminazione annullata');
      }
    });
  }
}
