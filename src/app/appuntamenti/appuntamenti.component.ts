import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-appuntamenti',
  templateUrl: './appuntamenti.component.html',
  styleUrls: ['./appuntamenti.component.css'],
})
export class AppuntamentiComponent implements OnInit {
  showDetails = false; // Variabile per gestire la visibilità dei dettagli

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Sottoscrivi agli eventi di navigazione del router
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Controlla il percorso corrente per determinare se mostrare i dettagli o la lista
        const currentPath = this.route.snapshot.firstChild?.routeConfig?.path;

        // Imposta showDetails a true solo se il path corrisponde a 'appuntamenti/:id'
        this.showDetails = currentPath === 'appuntamenti/:id';
        if(currentPath === 'appuntamenti/dentista/:id'){
          this.showDetails=true;
        }
        // Rilevamento dei cambiamenti forzato
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    // Utilizza setTimeout per evitare l'errore ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  onViewDetails() {
    // Mostra i dettagli con un timeout per evitare il problema di rilevamento delle modifiche
    setTimeout(() => {
      this.showDetails = true;
      this.cdr.detectChanges(); // Forza il rilevamento delle modifiche
    });
  }

  onBackToList() {
    // Torna alla lista con un timeout per evitare il problema di rilevamento delle modifiche
    setTimeout(() => {
      this.showDetails = false;
      this.cdr.detectChanges(); // Forza il rilevamento delle modifiche
    });
  }

  onActivate(event: any) {
    // Quando un componente viene attivato, controlla se è il componente di dettaglio
    const isDettagliComponent =
      event.constructor.name === 'DettagliAppuntamentoComponent';
    if (this.showDetails !== isDettagliComponent) {
      this.showDetails = isDettagliComponent;
      this.cdr.detectChanges(); // Forza il rilevamento delle modifiche
    }
  }
}
