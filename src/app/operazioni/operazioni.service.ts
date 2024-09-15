import { EventEmitter, Injectable } from "@angular/core";
// import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Observable, Subject, catchError, map, throwError } from "rxjs";
import { Store } from "@ngrx/store";
import { Operazione } from "./operazione.model";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class OperazioneService {
  operazioniChanged = new Subject<Operazione[]>();
  private operazioni: Operazione[] = [];
  private apiUrl = 'http://localhost:8081/api/operazioni';

  constructor(private http: HttpClient) {}

  setOperazioni(operazioni: Operazione[]) {
    this.operazioni = operazioni;
    //perchè adesso abbiamo nuove operazioni creiamo copia nuova
    this.operazioniChanged.next(this.operazioni.slice());
  }

  getOperazioni(): Observable<Operazione[]> {
    return this.http.get<Operazione[]>(this.apiUrl).pipe(
      map((data) => {
        return data.map((item) => ({
          ...item,
          data: new Date(item.data),
        }));
      })
    );
  }

  getOperazione(id: string): Observable<Operazione> {
    return this.http.get<Operazione>(`${this.apiUrl}/${id}`).pipe(
      map((operazione: Operazione) => {
        if (!operazione) {
          throw new Error(`operazione con ID ${id} non trovato.`);
        }
        return operazione;
      }),
      catchError((error) => {
        console.error("Errore durante la richiesta dell'operazione:", error);
        return throwError(error);
      })
    );
  }

  addOperazione(operazione: Operazione) {
    this.http
      .post<Operazione>(this.apiUrl, operazione)
      .subscribe((nuovaOperazione) => {
        this.operazioni.push(nuovaOperazione);
        this.operazioniChanged.next(this.operazioni.slice());
      });
  }

  updateOperazione(id: string, newOperazione: Operazione) {
    this.http
      .put<Operazione>(`${this.apiUrl}/${id}`, newOperazione)
      .subscribe((updatedOperazione) => {
        const index = this.operazioni.findIndex((op) => op.id === id);
        if (index !== -1) {
          this.operazioni[index] = updatedOperazione;
          this.operazioniChanged.next(this.operazioni.slice());
        }
      });
  }

  deleteOperazione(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.operazioni = this.operazioni.filter((op) => op.id !== id);
      this.operazioniChanged.next(this.operazioni.slice());
    });
  }
}