import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as AuthActions from "./store/auth.actions";
import * as fromApp from './store/app.reducer';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { UserModel } from "./user.model";
import { jwtDecode } from "jwt-decode";
import { UserRoleAndCalendarService } from "../userRoleAndCalendar.service";
import { environment } from "environments/environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // URL del backend Spring
  private _userRole = new BehaviorSubject<string | null>(null);
  userRole$ = this._userRole.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserRole();
  }

  getToken(): string | null {
    const token = localStorage.getItem('jwt');
    return token;
    // Se token è null, restituisce una stringa vuota invece di null
  }

  loadUserRole() {
    const role = this.getUserRole();
    this._userRole.next(role);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.ruolo;
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  }

  getUserId(): string | null {
    const token=this.getToken();
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          console.log("DECODED TOKEN ID: "+decodedToken.id);
          return decodedToken.id;
        } catch (error) {
          console.error('Error decoding token', error);
          return null;
        }
      }
      return null;
  }

  setUserRole(user: string): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return (decodedToken.ruolo = user);
    } else {
      return null;
    }
  }

  isDentist(): boolean {
    return this.getUserRole() === 'dentista';
  }

  login(token: string) {
    localStorage.setItem('jwt', token);
    this.loadUserRole();
  }

  logout() {
    localStorage.removeItem('jwt');
    console.log('TOKEN: ' + localStorage.getItem('jwt'));
    this._userRole.next(null);
    this.setUserRole('user');
    this.router.navigate(['/']);
  }

  getUserFromToken(): UserModel | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const expirationDate = new Date(decodedToken.exp * 1000); // Conversione dal timestamp Unix
        return new UserModel(
          decodedToken.email,
          decodedToken.id,
          decodedToken.ruolo,
          token,
          expirationDate
        );
      } catch (error) {
        console.error('Error decoding token', error);
        return null;
      }
    }
    return null;
  }
}

