import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map, take, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
 import * as fromApp from "./store/app.reducer";
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  ruolo: string;
}

@Injectable({ providedIn: 'root' }) //implements CanActivate
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  //  L'AuthGuard controlla direttamente il localStorage per verificare se c'è un token
  //  JWT memorizzato e decide se consentire o meno l'accesso alle rotte protette.
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = localStorage.getItem('jwt');
     console.log('AuthGuard: token found in localStorage', token);
    if (token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);
        console.log('Decoded token payload:', decodedToken);
        const userRole = decodedToken.ruolo;
        // if (this.checkRoleAuthorization(route.data.expectedRoles, userRole)) {
        //   // Controlla se il ruolo dell'utente è autorizzato ad accedere alla pagina
        return true;
      } catch (error) {
        console.error('AuthGuard: Error decoding token', error);
        this.router.navigate(['/login']);
        return false;
      }
    }
       else {
        // Altrimenti, reindirizza l'utente alla pagina di login
         console.log('AuthGuard: No token found, redirecting to login');
        console.log('ci troviamo in auth.guard.ts');
        return this.router.createUrlTree(['/login']);
      }
    }
  }

//   checkRoleAuthorization(expectedRoles: string[], userRole: string): boolean {
//     // Verifica se il ruolo dell'utente è incluso tra quelli autorizzati
//     return expectedRoles.includes(userRole);
//   }
// }

