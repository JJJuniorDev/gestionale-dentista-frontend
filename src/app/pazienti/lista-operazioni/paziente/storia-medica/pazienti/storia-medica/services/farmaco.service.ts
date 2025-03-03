import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Farmaco } from '../models/farmaco.model';


@Injectable({
  providedIn: 'root',
})
export class FarmacoService {
  private apiUrl = 'http://localhost:8080/api/pazienti/farmaci';

  constructor(private http: HttpClient) {}

  // Metodo per ottenere i dettagli di un farmaco per ID
  getFarmacoById(id: string): Observable<Farmaco> {
    return this.http.get<Farmaco>(`${this.apiUrl}/${id}`);
  }

  // Metodo per cercare farmaci per nome
  cercaFarmaco(nome: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cerca/${nome}`).pipe(
      catchError((error) => {
        console.error('Errore nella chiamata API per cercaFarmaco:', error);
        return throwError(() => new Error('Errore nella ricerca del farmaco'));
      })
    );
  }

  // Metodo per cercare farmaci per categoria (per esempio, "ansiolitici")
  cercaFarmaciPerCategoriaPaginata(
    categoria: string,
    pagina: number,
    elementiPerPagina: number
  ): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/categoria/${categoria}`, {
        params: {
          pagina: pagina.toString(), // Aggiungi il parametro pagina
          elementiPerPagina: elementiPerPagina.toString(), // Aggiungi il parametro elementiPerPagina
        },
      })
      .pipe(
        catchError((error) => {
          console.error(
            'Errore nella chiamata API per cercaFarmaciPerCategoria:',
            error
          );
          return throwError(
            () => new Error('Errore nella ricerca dei farmaci per categoria')
          );
        })
      );
  }
  
  // Metodo per ottenere tutte le categorie
  ottieniCategorie(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categorie`);
  }
}
