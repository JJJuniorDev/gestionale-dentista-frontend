// user-settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserModel } from './user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private apiUrl = environment.apiUrl + '/users'; // Backend API URL

  constructor(private http: HttpClient) {}

  // Aggiorna i dati dell'utente
  updateUserData(updatedUserData: any): Observable<any> {
    const userId = updatedUserData.id; // Assicurati che il modello contenga l'id
    console.log(updatedUserData);
    return this.http.put(`${this.apiUrl}/role/${userId}`, updatedUserData);
  }

  // Metodo per ottenere l'utente per email
  getUserByEmail(email: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/email/${email}`);
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl).pipe(
      map((data) => {
        if (!data) {
          console.log('DATI USERS NON TROVATI');
          return [];
        }
        // return data.map((user) =>({
        //   ...user
        // }));
        return data;
      })
    );
  }

  getUserById(userId: string): any {
    return this.http.get<UserModel>(`${this.apiUrl}/${userId}`);
  }
}
