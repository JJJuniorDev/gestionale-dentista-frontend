import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { catchError, exhaustMap, map, take } from "rxjs/operators";
import { Store } from "@ngrx/store";
import * as fromApp from "./store/app.reducer";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  //implements HttpInterceptor
  //voglio aggiungere il token alla richiesta dell'intercept
  constructor(
    private authService: AuthService,
    private store: Store<fromApp.AppState>,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const jwtToken = localStorage.getItem('jwt');
    let clonedRequest = req;

    if (jwtToken) {
      clonedRequest = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + jwtToken),
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token scaduto -> Logout automatico
          alert('Sessione scaduta. Effettua nuovamente il login.');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}

