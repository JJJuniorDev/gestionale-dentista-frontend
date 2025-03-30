import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Paziente } from 'src/app/pazienti/paziente.model';
import { PazienteService } from 'src/app/pazienti/paziente.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-select-patient-dialog',
  templateUrl: './select-patient-dialog.component.html',
  styleUrls: ['./select-patient-dialog.component.css'],
})
export class SelectPatientDialogComponent implements OnInit {
  searchControl = new FormControl('');
  patients: Paziente[] = [];
  filteredPatients: Paziente[] = [];
  selectedPatient: Paziente | null = null;
  page = 0;
  pageSize = 5;
dottoreId: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<SelectPatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private patientsService: PazienteService,
    private authService: AuthService
  ) {}

  ngOnInit() {
     this.authService.user$.subscribe((user) => {
       if (user) {
         this.dottoreId! = user.id; // Ottieni l'ID dell'utente loggato
       }
     });
    this.loadPatients();
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.filterPatients(value!);
      });
  }

  loadPatients() {
    this.patientsService.getPazienti(this.dottoreId!).subscribe((data) => {
      this.patients = data;
      this.filterPatients('');
    });
  }

  filterPatients(query: string) {
    this.filteredPatients = this.patients
      .filter(
        (p) =>
          p.nome.toLowerCase().includes(query.toLowerCase()) ||
          p.codiceFiscale.toLowerCase().includes(query.toLowerCase())
      )
      .slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
  }

  selectPatient(patient: Paziente) {
    this.selectedPatient = patient;
  }

  confirmSelection() {
    if (this.selectedPatient) {
      this.dialogRef.close(this.selectedPatient);
    }
  }

  close() {
    this.dialogRef.close();
  }

  changePage(step: number) {
    const newPage = this.page + step;
    if (newPage >= 0 && newPage * this.pageSize < this.patients.length) {
      this.page = newPage;
      this.filterPatients(this.searchControl.value || '');
    }
  }
}
