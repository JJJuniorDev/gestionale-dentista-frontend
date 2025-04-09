import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaDTO } from 'src/app/pazienti/lista-operazioni/paziente/storia-medica/pazienti/storia-medica/models/notaDTO.model';
import { environment } from 'src/environments/environment';
import { Nota } from 'src/app/pazienti/lista-operazioni/paziente/storia-medica/pazienti/storia-medica/models/nota.model';


@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getNotes(dottoreId: string): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(
      this.apiUrl + `/nota?dottoreId=${dottoreId}`
    );
  }

  getNotesArchiviate(dottoreId: string): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(
      this.apiUrl + `/nota/archiviateByDottoreId?dottoreId=${dottoreId}`
    );
  }

  addNote(note: NotaDTO): Observable<NotaDTO> {
    return this.http.post<NotaDTO>(this.apiUrl + '/nota/crea', note);
  }

  updateNote(note: NotaDTO): Observable<NotaDTO> {
    return this.http.put<NotaDTO>(
      this.apiUrl + '/nota/updateAssignation',
      note
    );
  }

  getNotesByPatient(patientId: string): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(
      `${this.apiUrl}/nota/byPatientId?patientId=${patientId}`
    );
  }

  archiviaNota(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/nota/archivia/${id}`, {});
  }

  deleteNota(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/nota/delete/${id}`, {});
}
}
