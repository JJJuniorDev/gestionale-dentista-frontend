import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../auth/store/app.reducer';
import { map, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UserRoleAndCalendarService } from '../userRoleAndCalendar.service';
import { AppuntamentoService } from '../appuntamenti/appuntamento.service';
import { Appuntamento } from '../appuntamenti/appuntamento.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription = new Subscription();
  isAuthenticated = false;
  currentRoute: string = '';
  isDentist: boolean = false;

  constructor(
    private authService: AuthService,
    private store: Store<fromApp.AppState>,
    private router: Router,
    private userRoleService: UserRoleAndCalendarService,
    private appuntamentoService: AppuntamentoService
  ) {
    this.userSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isDentist = authService.getUserRole() === 'dentista';
        this.userRoleService.setIsDentist(this.isDentist); // Imposta lo stato dell'utente
        console.log('Header.ts->Is Dentist:', this.isDentist);
      });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  ngOnInit() {
    this.userSub.add(
      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd => event instanceof NavigationEnd
          )
        )
        .subscribe((event: NavigationEnd) => {
          this.currentRoute = event.urlAfterRedirects;
        })
    );
  }

  onGoToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  onGoToAppointments() {
    this.router.navigate(['/appuntamenti']);
  }

  onGoToPatients() {
    this.router.navigate(['/pazienti']);
  }

  onGoToOperazioni() {
    this.router.navigate(['/operazioni']);
  }

  onGoToStatistics() {
    this.router.navigate(['/statistics']);
  }

  onLogout() {
    this.authService.logout();
  }

  onGoToDentistAppointments() {
    const dentistId = this.authService.getUserId(); // Ottieni l'ID dell'utente autenticato

    // Sottoscrizione all'Observable per ottenere i dati e stamparli
    this.appuntamentoService.getAppuntamentiPerDentista(dentistId!).subscribe({
      next: (getAppDentista) => {
        console.log('RISULTATO ===', getAppDentista); // Stampa i risultati nel console
        // Passa i dati attraverso lo stato della navigazione
        this.router.navigate([`/appuntamenti/dentista/${dentistId}`], {
          state: { appuntamenti: getAppDentista },
        });
      },
      error: (err) => {
        console.error('Errore nel recupero degli appuntamenti:', err); // Gestione dell'errore
      },
    });
  }
}
