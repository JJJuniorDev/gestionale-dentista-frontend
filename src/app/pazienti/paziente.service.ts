import { EventEmitter, Injectable } from '@angular/core';
// import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Observable, Subject, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Paziente } from './paziente.model';
import { PatientTreatmentPlan } from './patient-treatment-plans/PatientTreatmentPlan.model';
import { AppuntamentoDTO } from '../appuntamenti/appuntamentoDTO.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class PazienteService {
  pazientiChanged = new Subject<Paziente[]>();
  private pazienti: Paziente[] = [];
  private apiUrl = environment.pazientiMicroserviceUrl + '/pazienti';

  constructor(private http: HttpClient) {}

  deactivatePlan(treatmentPlanId: string) {
    return this.http.delete(`${this.apiUrl}/deactivatePlan/${treatmentPlanId}`);
  }

  // Aggiorna il paziente aggiungendo l'ID dell'appuntamento
  updatePazienteAppuntamenti(pazienteId: string, appuntamentoId: string) {
    // const url = `${this.apiUrl}/${pazienteId}/aggiungi-appuntamento`;
    return this.http
      .put(
        `${this.apiUrl}/${pazienteId}/aggiungi-appuntamento`,
        appuntamentoId,
        {
          headers: new HttpHeaders({
            'Content-Type': 'text/plain',
            // NON aggiungere Authorization qui, ci pensa l'interceptor!
          }),
          // oppure rimuovi proprio 'headers' se non serve specificarlo
        }
      )
      .subscribe(() => {
        console.log('Appuntamento aggiunto con successo!');
      });
  }

  setPazienti(pazienti: Paziente[]) {
    this.pazienti = pazienti;
    //perchè adesso abbiamo nuovi pazienti creiamo copia nuova
    this.pazientiChanged.next(this.pazienti.slice());
  }

  getPazienti(dottoreId: string): Observable<Paziente[]> {
    return this.http
      .get<any>(this.apiUrl, {
        params: { dottoreId }, // Invia dottoreId come parametro
      })
      .pipe(
        map((data) => {
          return data.pazienti.map((item: any) => ({
            ...item,
            id: item.id,
            appuntamentiIds: item.appuntamentiIds, // Include direttamente gli appuntamentiIds
          }));
        })
      );
  }

  getPaziente(id: string): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.apiUrl}/${id}`);
  }

  getPazienteByCF(codiceFiscale: string): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.apiUrl}/${codiceFiscale}/byCF`);
  }

  addPaziente(paziente: Paziente) {
    this.http
      .post<Paziente>(this.apiUrl, paziente, {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe((nuovoPaziente) => {
        this.pazienti.push(nuovoPaziente);
        this.pazientiChanged.next(this.pazienti.slice());
      });
  }

  updatePaziente(id: string, newPaziente: Paziente) {
    this.http
      .put<Paziente>(`${this.apiUrl}/${id}`, newPaziente)
      .subscribe((updatedPaziente) => {
        const index = this.pazienti.findIndex((p) => p.id.toString() === id);
        if (index !== -1) {
          this.pazienti[index] = updatedPaziente; // Aggiorna l'oggetto locale
          this.pazientiChanged.next(this.pazienti.slice()); // Notifica i cambiamenti
        } else {
          console.error('Paziente non trovato nella lista!');
        }
      });
  }

  deletePaziente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
    //   this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
    //     this.pazienti.splice(
    //       this.pazienti.findIndex(
    //         //credo sia cosi, ovvero dove l'id reso a stringa combacia col nostro
    //         (p) => p.id.toString() === id
    //       ),
    //       1
    //     );
    //     this.pazientiChanged.next(this.pazienti.slice());
    //   });
    // }
  }

  getPatientTreatmentPlansByPatientId(pazienteId: string) {
    return this.http.get<PatientTreatmentPlan[]>(
      `${this.apiUrl}/${pazienteId}/piani`
    );
  }

  //TRATTAMENTO SINGOLO E SPECIFICO
  getTreatmentPlanById(
    pazienteId: string,
    planId: string
  ): Observable<PatientTreatmentPlan> {
    return this.http.get<PatientTreatmentPlan>(
      `${this.apiUrl}/${pazienteId}/piani/${planId}`
    );
  }

  addAppointmentToPlan(
    pazienteId: string,
    planId: string,
    appointmentId: string
  ): Observable<PatientTreatmentPlan> {
    // Mappiamo solo i campi richiesti dal backend
    return this.http.post<PatientTreatmentPlan>(
      `${this.apiUrl}/${pazienteId}/piani/${planId}/appointments/addAppointment`,
      appointmentId,
      {
        headers: { 'Content-Type': 'text/plain' }, // 🔹 Specifica il tipo di contenuto
      }
    );
  }

  addEventToPlan(
    pazienteId: string,
    planId: string,
    newEvent: {
      descrizione: string;
      dataEOrario: Date;
      deleted: boolean;
      tipologia: string;
      dottoreId: string;
    }
  ): Observable<PatientTreatmentPlan> {
    return this.http.post<PatientTreatmentPlan>(
      `${this.apiUrl}/${pazienteId}/piani/${planId}/events/addEvent`,
      newEvent
    );
  }

  updateStep(planId: string, step: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/piani/${planId}/steps/${step.id}`,
      step
    );
  }

  creaPianoTrattamento(nuovoPiano: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/piani`,
      nuovoPiano
    );
  }

  // Aggiungi un piano di trattamento di default per il paziente
  creaPianoDefault(pazienteId: string): Observable<PatientTreatmentPlan> {
    console.log('SIAMO in creaPianoDefault');
    const defaultPlan: PatientTreatmentPlan = {
      id: '', // Il backend dovrebbe generare l'ID
      pazienteId: pazienteId,
      nomePiano: 'Piano di trattamento vuoto',
      attivo: true,
      dataInizio: new Date().toISOString(),
      dataFine: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      appuntamenti: [], // Appuntamenti vuoti per ora
      eventi: [], // Eventi vuoti per ora
    };

    // Chiamata al backend per creare il piano di trattamento
    return this.http.post<PatientTreatmentPlan>(
      `${this.apiUrl}/${pazienteId}/piani`,
      defaultPlan,
      {
        headers: { 'Content-Type': 'application/json' }, // Imposta il tipo di contenuto come JSON
      }
    );
  }
}
