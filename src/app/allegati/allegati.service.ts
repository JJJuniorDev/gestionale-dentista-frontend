import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AllegatiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadAllegato(
    file: File,
    pazienteId: string | null,
    dottoreId: string
  ): Observable<any> {
    const formData = new FormData();
    console.log(formData);
    formData.append('file', file);
    if (pazienteId) {
      formData.append('pazienteId', pazienteId);
    }
    else if (!pazienteId){
      formData.append('pazienteId', 'default');
    }
    if (dottoreId) {
      formData.append('dottoreId', dottoreId);
    } 
    return this.http.post(`${this.baseUrl}/allegati/upload`, formData);
  }

  getAllegatiPerPaziente(pazienteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/allegati/paziente/${pazienteId}`);
  }

  getAllegatiPerDottore(dottoreId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/allegati/dottore/${dottoreId}`);
  }

  downloadAllegato(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/allegati/${id}/download`, {
      responseType: 'blob',
    });
  }

  // 📌 Elimina un allegato
  deleteAllegato(fileId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/allegati/delete/${fileId}`);
  }
}
