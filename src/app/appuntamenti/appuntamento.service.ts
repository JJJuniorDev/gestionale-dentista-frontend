import { Injectable } from '@angular/core';
// import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Observable, Subject, catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Appuntamento } from './appuntamento.model';
import { Operazione } from '../operazioni/operazione.model';

@Injectable()
export class AppuntamentoService {
  appuntamentiChanged = new Subject<Appuntamento[]>();
  private appuntamenti: Appuntamento[] = [];
  private apiUrl = 'http://localhost:8081/api/appuntamenti';

  constructor(private http: HttpClient) {}

  setAppuntamenti(appuntamenti: Appuntamento[]) {
    this.appuntamenti = appuntamenti;
    //perchè adesso abbiamo nuovi pazienti creiamo copia nuova
    this.appuntamentiChanged.next(this.appuntamenti.slice());
  }

  getAppuntamentiPerDentista(dentistaId: string): Observable<Appuntamento[]> {
    return this.http.get<Appuntamento[]>(
      `${this.apiUrl}/dentista/${dentistaId}`
    );
  }

  getAppuntamenti(): Observable<Appuntamento[]> {
    return this.http.get<Appuntamento[]>(this.apiUrl).pipe(
      map((data) => {
        if (!data) {
          return [];
        }
        return data.map((item) => ({
          ...item,
          data: new Date(item.dataEOrario),
        }));
      })
    );
  }

  getAppuntamento(id: string): Observable<Appuntamento> {
    return this.http.get<Appuntamento>(`${this.apiUrl}/${id}`).pipe(
      map((appuntamento: Appuntamento) => {
        if (!appuntamento) {
          throw new Error(`Appuntamento con ID ${id} non trovato.`);
        }
        return appuntamento;
      }),
      catchError((error) => {
        console.error("Errore durante la richiesta dell'appuntamento:", error);
        return throwError(
          () =>
            new Error("Impossibile ottenere l'appuntamento: " + error.message)
        );
      })
    );
  }

  addAppuntamento(appuntamento: Appuntamento) {
    this.http
      .post<Appuntamento>(this.apiUrl, appuntamento)
      .subscribe((nuovoAppuntamento) => {
        this.appuntamenti.push(nuovoAppuntamento);
        this.appuntamentiChanged.next(this.appuntamenti.slice());
      });
  }

  updateAppuntamento(id: string, newAppuntamento: Appuntamento) {
    this.http
      .put<Appuntamento>(`${this.apiUrl}/${id}`, newAppuntamento)
      .subscribe((updatedAppuntamento) => {
        const index = this.appuntamenti.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.appuntamenti[index] = updatedAppuntamento;
          this.appuntamentiChanged.next(this.appuntamenti.slice());
        }
      });
  }

  deleteAppuntamento(index: string): Observable<void> {
    // const id = this.appuntamenti[+index].id;
    return this.http.delete<void>(`${this.apiUrl}/${index}`);
  }

  deleteAppuntamentoLocally(index: number): void {
    this.appuntamenti.splice(index, 1);
    this.appuntamentiChanged.next(this.appuntamenti.slice());
  }

  addOperazioneToAppuntamento(appuntamentoId: string, operazione: Operazione) {
    this.http
      .put<Appuntamento>(
        `${this.apiUrl}/${appuntamentoId}/operazioni`,
        operazione
      )
      .subscribe((updatedAppuntamento) => {
        const index = this.appuntamenti.findIndex(
          (a) => a.id === appuntamentoId
        );
        if (index !== -1) {
          this.appuntamenti[index] = updatedAppuntamento;
          this.appuntamentiChanged.next(this.appuntamenti.slice());
        }
      });
  }
  getAppuntamentiFuturi(): Observable<Appuntamento[]> {
    const today = new Date(); // Data e ora attuale
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    ); // Normalizzazione a mezzanotte in UTC

    return this.getAppuntamenti().pipe(
      map((appuntamenti) => {
        return appuntamenti.filter((appuntamento) => {
          const appointmentDate = new Date(appuntamento.dataEOrario); // Converte la data dell'appuntamento
          // Controllo che l'appuntamento sia successivo alla data di oggi (UTC)
          return appointmentDate > todayUTC;
        });
      })
    );
  }
}
