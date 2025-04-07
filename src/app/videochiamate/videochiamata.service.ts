import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideochiamataDTO } from './videochiamataDTO.mode';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideochiamataService {
  private apiUrl = environment.apiUrl+'/videochiamate'; // URL del backend

  constructor(private http: HttpClient) {}

  creaVideochiamata(
    dottoreId: string,
    dataChiamata: string
  ): Observable<VideochiamataDTO> {
     const body = { dottoreId, dataChiamata };
    return this.http.post<VideochiamataDTO>(`${this.apiUrl}/crea`, body);
  }
  

  getVideochiamata(link: string): Observable<VideochiamataDTO> {
    return this.http.get<VideochiamataDTO>(`${this.apiUrl}/${link}`);
  }
}
