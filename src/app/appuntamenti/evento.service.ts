import { Injectable, Injector } from "@angular/core";
import { EventoDTO } from "./eventoDTO.model";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


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
}