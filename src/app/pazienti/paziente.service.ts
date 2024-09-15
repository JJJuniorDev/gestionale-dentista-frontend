import { EventEmitter, Injectable } from '@angular/core';
// import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Observable, Subject, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Paziente } from './paziente.model';

@Injectable()
export class PazienteService {
  pazientiChanged = new Subject<Paziente[]>();
  private pazienti: Paziente[] = [];
  private apiUrl = 'http://localhost:8082/api/pazienti';

  constructor(private http: HttpClient) {}

  setPazienti(pazienti: Paziente[]) {
    this.pazienti = pazienti;
    //perchè adesso abbiamo nuovi pazienti creiamo copia nuova
    this.pazientiChanged.next(this.pazienti.slice());
  }

  getPazienti(): Observable<Paziente[]> {
    return this.http.get<Paziente[]>(this.apiUrl).pipe(
      map((data) => {
        return data.map((item) => ({
          ...item,
          data: new Date(item.dataDiNascita),
        }));
      })
    );
  }

  getPaziente(id: number): Observable<Paziente> {
    return this.http.get<Paziente>(`${this.apiUrl}/${id}`);
  }

  addPaziente(paziente: Paziente) {
    this.http
      .post<Paziente>(this.apiUrl, paziente)
      .subscribe((nuovoPaziente) => {
        this.pazienti.push(nuovoPaziente);
        this.pazientiChanged.next(this.pazienti.slice());
      });
  }

  updatePaziente(index: number, newPaziente: Paziente) {
    const id = this.pazienti[index].id;
    this.http
      .put<Paziente>(`${this.apiUrl}/${id}`, newPaziente)
      .subscribe((updatedPaziente) => {
        this.pazienti[index] = updatedPaziente;
        this.pazientiChanged.next(this.pazienti.slice());
      });
  }

  deletePaziente(index: number) {
    const id = this.pazienti[index].id;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.pazienti.splice(index, 1);
      this.pazientiChanged.next(this.pazienti.slice());
    });
  }
}
