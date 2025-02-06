import { Component, Input } from "@angular/core";
import { JwtService } from "../jwt.service";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { UserRoleAndCalendarService } from "../userRoleAndCalendar.service";
import { Observable, Subscription } from "rxjs";
import { AppuntamentoService } from "../appuntamenti/appuntamento.service";
import { AppuntamentoDTO } from "../appuntamenti/appuntamentoDTO.model";
import { UserModel } from "../auth/user.model";
import { PazienteService } from "../pazienti/paziente.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // @Input() isDoctor!: boolean; 
  // private isDoctorSub!: Subscription;
  // todayAppointmentsCount: number = 0;
  // upcomingAppointments: AppuntamentoDTO[] = [];
  // upcomingAppointmentsCount: number = 0;
  // recentActivities: { message: string; date: Date }[] = [];
  // todayAppointments: AppuntamentoDTO[] = [];
  // paginatedTodayAppointments: AppuntamentoDTO[] = []; 
  // itemsPerPage: number = 4;
  // currentPage: number = 1; 
  // user: UserModel | undefined;

  // constructor(
  //   private service: JwtService,
  //   private authService: AuthService,
  //   private router: Router,
  //   private userRoleService: UserRoleAndCalendarService,
  //   private appuntamentoService: AppuntamentoService,
  //   private pazienteService: PazienteService
  // ) {}

  // ngOnInit() {
  //   this.isDoctor = this.authService.isDoctor(); 
  //   this.loadTodayAppointments(); 
    
  // }

  // loadTodayAppointments() {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   this.appuntamentoService.getAppuntamenti().subscribe((appuntamenti) => {
     
  //     this.todayAppointments = appuntamenti.filter((appuntamento) => {
  //       const appointmentDate = new Date(appuntamento.dataEOrario);
  //       appointmentDate.setHours(0, 0, 0, 0); 
  //       return appointmentDate.getTime() === today.getTime();
  //     });
    
  //     this.todayAppointments.forEach((appuntamento) => {
  //       this.loadPatientFromAppointment(appuntamento);
  //     });
  //     this.updatePaginatedAppointments();
  //   });
  // }

  // loadPatientFromAppointment(appuntamento: AppuntamentoDTO) {
   
  //   const pazienteId = appuntamento.pazienteId;

  //   this.pazienteService.getPaziente(pazienteId).subscribe(
  //     (paziente) => {
       
  //       appuntamento.paziente = paziente;
  //     },
  //     (error) => {
  //       console.error("Errore nel recupero del paziente:", error);
  //     }
  //   );

  // }

  // updatePaginatedAppointments() {
  //   const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  //   const endIndex = startIndex + this.itemsPerPage;
  //   this.paginatedTodayAppointments = this.todayAppointments.slice(
  //     startIndex,
  //     endIndex
  //   );
  // }

  // nextPage() {
  //   if (this.currentPage * this.itemsPerPage < this.todayAppointments.length) {
  //     this.currentPage++;
  //     this.updatePaginatedAppointments();
  //   }
  // }

  // previousPage() {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     this.updatePaginatedAppointments();
  //   }
  // }

  // hasNextPage(): boolean {
  //   return this.currentPage * this.itemsPerPage < this.todayAppointments.length;
  // }

  // hasPreviousPage(): boolean {
  //   return this.currentPage > 1;
  // }

  // getUpcomingAppointments() {
  //   this.appuntamentoService
  //     .getAppuntamentiFuturi()
  //     .subscribe((appuntamenti) => {
  //       this.upcomingAppointments = appuntamenti;
  //       this.upcomingAppointmentsCount = appuntamenti.length; 
  //       console.log(this.upcomingAppointmentsCount);
  //     });
  // }

  // viewAppointmentsToday() {
  //   this.router.navigate(['/appuntamenti']); 
  // }

  // viewUpcomingAppointments() {
  //   this.appuntamentoService
  //     .getAppuntamentiFuturi()
  //     .subscribe((appuntamenti) => {
  //       this.upcomingAppointments = appuntamenti;
  //       this.upcomingAppointmentsCount = appuntamenti.length;
  //       this.router.navigate(['/appuntamenti/upcoming']);
  //     });
  // }

  // onSelectAppuntamento(id: string) {
  //   this.router.navigate(['/appuntamenti', id]);
  // }

  // viewStatistics() {
  //   this.router.navigate(['/statistics']);
  // }

  // navigateToNewAppointment() {
  //   this.router.navigate(['/appuntamenti/new']);
  // }

  // navigateToSettings() {
  //   this.router.navigate(['/users']);
  // }

  // navigateToPazienti(): void {
  //   this.router.navigate(['/pazienti']);
  // }

  // navigateToAppuntamenti(): void {
  //   this.router.navigate(['/appuntamenti']);
  // }

  // logout(): void {
  //   this.authService.logout();
  // }

  // getStatoIcon(stato: string): string {
  //   switch (stato?.toLowerCase()) {
  //     case 'eseguito':
  //       return '✅';
  //     case 'in_esecuzione':
  //       return '⏳';
  //     case 'futuro':
  //       return '✔️';
  //     case 'annullato':
  //       return '❌';
  //     case 'sospeso':
  //       return '🔄';
  //     default:
  //       return '❓';
  //   }
  // }
}
