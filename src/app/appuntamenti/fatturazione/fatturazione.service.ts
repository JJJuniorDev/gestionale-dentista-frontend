import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Fattura } from '../fatturazione/fattura.model';

@Injectable()
export class FatturazioneService {
  private apiUrl = 'http://localhost:8080/api/appuntamenti';

  constructor(private http: HttpClient) {}

  getFatturaByAppuntamentoId(appuntamentoId: string): Observable<Fattura> {
    return this.http.get<Fattura>(
      `${this.apiUrl}/${appuntamentoId}/getFattura`
    );
    // .pipe(
    //   tap((fattura) => {
    //     console.log('Fattura ricevuta: ', fattura); // Verifica la risposta
    //   })
    // )
  }

  createFattura(appuntamentoId: string, fattura: Fattura): Observable<Fattura> {
    return this.http.post<Fattura>(
      `${this.apiUrl}/${appuntamentoId}/newFattura`,
      fattura
    );
  }

  updateFattura(fattura: Fattura): Observable<Fattura> {
    return this.http.put<Fattura>(
      `${this.apiUrl}/${fattura.fatturaId}`,
      fattura
    );
  }

  sendEmail(appuntamentoId: string, email: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${appuntamentoId}/sendEmail`,
      { email } // Imposta l'email come oggetto JSON
    );
  }
  sendWhatsAppMessage( appuntamentoId: string, phoneNumber: string ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${appuntamentoId}/sendWhatsApp`, // URL dell'endpoint backend
      { phoneNumber } // Payload JSON con il numero di telefono
    );
  }
}
