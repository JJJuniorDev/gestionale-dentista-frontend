import { Component, OnInit } from '@angular/core';
import * as fromApp from './auth/store/app.reducer';
import { Store } from '@ngrx/store';
import { AuthService } from './auth/auth.service';
import { filter, map } from 'rxjs';
import { Event, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  //implements OnInit
  isAuthenticated = false;
  isDentist: boolean = false;
  showHeader = true;

  constructor(
    private authService: AuthService,
    private store: Store<fromApp.AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    // Controlla se la rotta corrente è il login
    this.router.events
      .pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeader = !event.urlAfterRedirects.includes('/login');
      });
      
    this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        this.isDentist = this.authService.getUserRole() === 'dentista';
      });
    console.log(
      'App.component.ts->is dentist: ' +
        this.isDentist +
        '. Ruolo: ' +
        this.authService.getUserRole()
    );
    // Aggiungere un ulteriore controllo in caso di cambiamenti dell'utente
    this.authService.userRole$.subscribe((role) => {
      this.isDentist = role === 'dentista';
    });
  }

  title = 'gestionale-dentista';

  // ngOnInit() {
  //   throw new Error('Method not implemented.');
  // }
}
