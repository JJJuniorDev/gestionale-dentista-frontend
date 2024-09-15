import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Appuntamento } from '../appuntamento.model';
import { AppuntamentoService } from '../appuntamento.service';

@Component({
  selector: 'app-dettagli-appuntamento',
  templateUrl: './dettagli-appuntamento.component.html',
  styleUrls: ['./dettagli-appuntamento.component.css'],
})
export class DettagliAppuntamentoComponent implements OnInit {
  appuntamenti: Appuntamento[] = []; // Lista degli appuntamenti (se disponibile)
  appuntamento: Appuntamento | null = null; // Singolo appuntamento (se disponibile)
  id!: string;

  constructor(
    private appuntamentoService: AppuntamentoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    // if (navigation?.extras?.state?.['appuntamenti']) {
    //   this.appuntamenti = navigation.extras.state['appuntamenti'];
    //   console.log(
    //     'Appuntamenti ricevuti tramite navigazione:',
    //     this.appuntamenti
    //   );
    // } else {
      this.route.params.subscribe((params: Params) => {
        this.id = params['id'];
        if (this.id) {
          // Se hai bisogno di tutti gli appuntamenti di un dentista
          this.appuntamentoService
            .getAppuntamentiPerDentista(this.id)
            .subscribe({
              next: (appuntamenti: Appuntamento[]) => {
                this.appuntamenti = appuntamenti;
                console.log('Appuntamenti caricati:', this.appuntamenti);
              },
              error: (err) => {
                console.error(
                  'Errore nel caricamento degli appuntamenti:',
                  err
                );
              },
            });
        }
      });
    //}
  }

  // Metodo per la modifica dell'appuntamento
  onAppuntamentoEdit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router
        .navigate([`/appuntamenti/${id}/edit`], { relativeTo: this.route })
        .then((success) =>
          console.log(
            `Navigazione a /appuntamenti/${id}/edit riuscita`,
            success
          )
        )
        .catch((error) => console.error('Errore nella navigazione:', error));
    } else {
      console.error('ID non trovato nei parametri della rotta');
    }
  }

  // Metodo per la cancellazione dell'appuntamento
  onDeleteAppuntamento() {
    if (this.id) {
      this.appuntamentoService.deleteAppuntamento(this.id).subscribe(() => {
        this.router.navigate(['/appuntamenti/lista-appuntamenti']);
      });
    }
  }
}
