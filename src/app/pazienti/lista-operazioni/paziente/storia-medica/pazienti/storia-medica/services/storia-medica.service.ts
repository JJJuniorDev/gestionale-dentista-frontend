import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { StoriaMedica } from '../models/storia-medica.model';
import { FarmacoInUso } from '../models/farmaco-in-uso.model';

@Injectable({
  providedIn: 'root',
})
export class StoriaMedicaService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  getStoriaMedica(pazienteId: string): Observable<StoriaMedica> {
    return this.http
      .get<StoriaMedica>(
        `${this.apiUrl}/pazienti/medical-history/${pazienteId}`
      )
      .pipe(
        catchError((error) => {
          console.error('Errore nella chiamata API:', error);
          return throwError(
            () => new Error('Errore durante il recupero della storia medica')
          );
        })
      );
  }

  // Metodo per salvare un farmaco in uso
  salvaFarmacoInUso(farmacoInUso: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/farmaco-in-uso/aggiungi`,
      farmacoInUso
    );
  }

  aggiornaFarmacoInUsoDisattiva(farmacoInUso: FarmacoInUso): Observable<any> {
    const id = farmacoInUso.id.toString(); // Convertire esplicitamente l'ID in stringa
    return this.http.put<any>(
      `${this.apiUrl}/farmaco-in-uso/aggiornaDisattiva/${id}`,
      farmacoInUso
    );
  }

  modificaFarmacoInUso(farmacoInUso: FarmacoInUso): Observable<any> {
    const id = farmacoInUso.id.toString(); // Convertire esplicitamente l'ID in stringa
    return this.http.put<any>(
      `${this.apiUrl}/farmaco-in-uso/modifica/${id}`,
      farmacoInUso
    );
  }

  eliminaFarmacoInUso(id: string, pazienteId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/farmaco-in-uso/${id}/${pazienteId}`
    );
  }

  aggiungiAppuntamentoAlFarmacoInUso(
    farmacoId: string,
    appuntamentoId: string
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/farmaco-in-uso/prenota-appuntamento/${farmacoId}/aggiungiAppuntamento`,
      appuntamentoId, // Passa direttamente la stringa
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  aggiungiNota(nota: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nota/crea`, nota);
  }
}
