import { Component, OnInit } from '@angular/core';
import * as fromApp from './auth/store/app.reducer';
import { Store } from '@ngrx/store';
import { AuthService } from './auth/auth.service';
import { filter, map } from 'rxjs';
import { Event, NavigationEnd, Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { Location } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  //implements OnInit
  isAuthenticated = false;
  isDoctor: boolean = false;
  showHeader = true;

  constructor(
    private authService: AuthService,
    private store: Store<fromApp.AppState>,
    private router: Router,
    private location: Location,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() { 
    // Controlla se la rotta corrente è il login
    this.router.events
      .pipe(
        filter(
          (event: Event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.showHeader = !event.urlAfterRedirects.includes('/login');
      });

    this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        this.isDoctor = this.authService.getUserRole() === 'dottore';
      });
   
    // Aggiungere un ulteriore controllo in caso di cambiamenti dell'utente
    this.authService.userRole$.subscribe((role) => {
      this.isDoctor = role === 'dottore';
    });
  }

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  title = 'gestionale-dentista';

  // ngOnInit() {
  //   throw new Error('Method not implemented.');
  // }
}
