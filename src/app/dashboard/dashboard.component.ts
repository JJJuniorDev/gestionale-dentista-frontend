import { Component, Input } from "@angular/core";
import { JwtService } from "../jwt.service";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { UserRoleAndCalendarService } from "../userRoleAndCalendar.service";
import { Observable, Subscription } from "rxjs";
import { AppuntamentoService } from "../appuntamenti/appuntamento.service";
import { Appuntamento } from "../appuntamenti/appuntamento.model";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // message: string | undefined;
  @Input() isDentist!: boolean; // Riceve il valore come input
  private isDentistSub!: Subscription;
  todayAppointmentsCount: number = 0;
  upcomingAppointments: Appuntamento[] = [];
  upcomingAppointmentsCount: number = 0;
  recentActivities: { message: string; date: Date }[] = [];

  constructor(
    private service: JwtService,
    private authService: AuthService,
    private router: Router,
    private userRoleService: UserRoleAndCalendarService,
    private appuntamentoService: AppuntamentoService
  ) {}

  ngOnInit() {
    this.isDentist = this.authService.isDentist(); // Ottiene il valore dal servizio
    this.recentActivities = [
      { message: 'Nuovo appuntamento prenotato', date: new Date() },
      { message: 'Recensione ricevuta', date: new Date() },
    ];
  }

  getUpcomingAppointments() {
    this.appuntamentoService
      .getAppuntamentiFuturi()
      .subscribe((appuntamenti) => {
        this.upcomingAppointments = appuntamenti;
        this.upcomingAppointmentsCount = appuntamenti.length; // Conta gli appuntamenti futuri
        console.log(this.upcomingAppointmentsCount);
      });
  }

  viewAppointmentsToday() {
    this.router.navigate(['/appuntamenti']); //   /today
  }

  viewUpcomingAppointments() {
    this.getUpcomingAppointments();
    // Esegui la navigazione solo dopo che i dati sono stati caricati
    setTimeout(() => {
      this.router.navigate(['/appuntamenti/upcoming']);
    }, 0); // Usa un timeout per assicurarti che la navigazione avvenga dopo l'aggiornamento dei dati
  }

  viewServices() {
    this.router.navigate(['/servizi-dentali']);
  }

  viewStatistics() {
    this.router.navigate(['/statistics']);
  }

  navigateToNewAppointment() {
    this.router.navigate(['/appuntamenti/new']);
  }

  navigateToSettings() {
    this.router.navigate(['/users']);
  }

  navigateToOperazioni(): void {
    this.router.navigate(['/operazioni']);
  }

  navigateToPazienti(): void {
    this.router.navigate(['/pazienti']);
  }

  navigateToAppuntamenti(): void {
    this.router.navigate(['/appuntamenti']);
  }

  navigateToServiziDentali(): void {
    this.router.navigate(['/servizi-dentali']);
  }

  logout(): void {
    this.authService.logout();
  }
}
