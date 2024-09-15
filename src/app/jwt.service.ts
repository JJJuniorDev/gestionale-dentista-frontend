import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

 const BASE_URL = ['http://localhost:8080/api/'];

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private http: HttpClient) {}

  register(signRequest: any): Observable<any> {
    return this.http.post(BASE_URL + 'signup', signRequest);
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post(BASE_URL + 'login', loginRequest);
  }

  checkEmail(email: string): Observable<boolean> {
    const headers = this.createAuthorizationHeader();
    return this.http.post<boolean>(BASE_URL + 'check-email', { email });
  }

  private createAuthorizationHeader() {
    const jwtToken = localStorage.getItem('jwt');
    if (jwtToken) {
      console.log('JWT token found in local storage', jwtToken);
      return new HttpHeaders().set('Authorization', 'Bearer ' + jwtToken);
    } else {
      console.log('JWT token not found in local storage');
      // Ritorna un oggetto HttpHeaders vuoto
      return new HttpHeaders();
    }
  }
}
