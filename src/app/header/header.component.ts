import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../auth/store/app.reducer';
import { map, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { UserRoleAndCalendarService } from '../userRoleAndCalendar.service';
import { AppuntamentoService } from '../appuntamenti/appuntamento.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription = new Subscription();
  isAuthenticated = false;
  currentRoute: string = '';
  isDoctor: boolean = false;

  constructor(
    private authService: AuthService,
    private store: Store<fromApp.AppState>,
    private router: Router,
    private userRoleService: UserRoleAndCalendarService,
    private appuntamentoService: AppuntamentoService
  ) {
    //   this.userSub = this.store
    //     .select('auth')
    //     .pipe(
    //       map((authState) => authState.user),
    // ).subscribe((user) => {
    //       this.isDoctor = authService.getUserRole() === 'dottore';
    //       this.userRoleService.setIsDoctor(this.isDoctor); // Imposta lo stato dell'utente
    //       console.log('Header.ts->Is isDoctor:', this.isDoctor);
    //     });
  }

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar) {
      new bootstrap.Collapse(navbar, { toggle: false }).hide();
    }
  }
  
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  ngOnInit() {
    // Sottoscrizione al ruolo dell'utente
    this.userSub = this.authService.userRole$.subscribe((role) => {
      this.isDoctor = role === 'dottore';
      this.userRoleService.setIsDoctor(this.isDoctor);
      console.log('Header.ts -> Is Doctor:', this.isDoctor);
    });
    // Traccia la route corrente
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

  onGoToSettings() {
    this.router.navigate(['/users']);
  }

  onGoToAllegati() {
    this.router.navigate(['/allegati']);
  }

  onGoToArchivio() {
    this.router.navigate(['/archivio']);
  }

  onGoToAppointments() {
    this.router.navigate(['/appuntamenti']);
  }

  onGoToPatients() {
    this.router.navigate(['/pazienti']);
  }

  onGoToNotes() {
    this.router.navigate(['/note']);
  }

  onGoToStatistics() {
    this.router.navigate(['/statistics']);
  }

  onLogout() {
    this.authService.logout();
  }

  onGoToDoctorAppointments() {
    const dottoreId = this.authService.getUserId(); // Ottieni l'ID dell'utente autenticato
    this.appuntamentoService.getAppuntamentiPerDottore(dottoreId!).subscribe({
      next: (getAppDottore) => {
        console.log('RISULTATO ===', getAppDottore); // Stampa i risultati nel console
        // Passa i dati attraverso lo stato della navigazione
        this.router.navigate([`/appuntamenti/dottore/${dottoreId}`]);
      },
      error: (err) => {
        console.error('Errore nel recupero degli appuntamenti:', err); // Gestione dell'errore
      },
    });
  }
}
