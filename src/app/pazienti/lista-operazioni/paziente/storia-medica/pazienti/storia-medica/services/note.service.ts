import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Nota } from "../models/nota.model";
import { Observable } from "rxjs";
import { NotaDTO } from "../models/notaDTO.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  getNotesByIds(ids: string[]): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.apiUrl}/getByIds`, {
      params: { ids: ids.join(',') },
    });
  }
}
