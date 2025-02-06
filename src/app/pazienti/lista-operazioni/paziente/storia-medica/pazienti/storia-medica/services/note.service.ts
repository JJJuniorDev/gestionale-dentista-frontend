import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Nota } from "../models/nota.model";
import { Observable } from "rxjs";
import { NotaDTO } from "../models/notaDTO.model";

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private apiUrl = 'http://localhost:8082/api/nota';

  constructor(private http: HttpClient) {}
  getNotesByIds(ids: string[]): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.apiUrl}/getByIds`, {
      params: { ids: ids.join(',') },
    });
  }
}
