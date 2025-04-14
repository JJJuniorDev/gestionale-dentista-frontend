import { Injectable, Injector } from "@angular/core";
import { EventoDTO } from "./eventoDTO.model";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private eventi: EventoDTO[] = [];
  private apiUrl = environment.appuntamentoMicroserviceUrl;

  constructor(private http: HttpClient) {}

  getEventiPerDottore(dottoreId: string): Observable<EventoDTO[]> {
    console.log('SIAMO IN GETEVENTI PER DOTTORE');
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventi/${dottoreId}`);
  }

  getEvento(id: string): Observable<EventoDTO> {
    return this.http
      .get<EventoDTO>(`${this.apiUrl}/eventi/eventoSingolo/${id}`)
      .pipe(
        map((appuntamento: EventoDTO) => {
          if (!appuntamento) {
            throw new Error(`Appuntamento con ID ${id} non trovato.`);
          }
          return appuntamento;
        }),
        catchError((error) => {
          console.error(
            "Errore durante la richiesta dell'appuntamento:",
            error
          );
          return throwError(
            () =>
              new Error("Impossibile ottenere l'appuntamento: " + error.message)
          );
        })
      );
  }

  deleteEvento(id: string): Observable<void> {
    // const id = this.appuntamenti[+index].id;
    return this.http.delete<void>(`${this.apiUrl}/eventi/delete/${id}`);
  }

  createEvent(evento: EventoDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/eventi/creaEvento`, evento);
  }
  updateEvent(id: string, formData: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/eventi/update/${id}`, formData);
  }
}