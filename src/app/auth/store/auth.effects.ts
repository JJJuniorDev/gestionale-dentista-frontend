import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as AuthActions from "./auth.actions";
import { HttpClient } from "@angular/common/http";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { UserModel } from "../user.model";
import { AuthService } from "../auth.service";

export interface AuthResponseData {
  //campi che ci ritornano con la post del signUp da firebase
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean; //? lo rende opzionale perchè ci torna al login ma non al signup
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string
) => {
  const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
//  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate,
  });
};
// const handleError = (errorRes: any) => {
//   let errorMessage = "¡Errore sconosciuto!";
//   if (!errorRes.error || !errorRes.error.error) {
//     return of(new AuthActions.AuthenticateFail(errorMessage));
//   }
//   switch (errorRes.error.error.message) {
//     case "EMAIL_EXISTS":
//       errorMessage = "¡El correo introducido ya existe!";
//       break;
//     case "EMAIL_NOT_FOUND":
//       errorMessage = "¡Correo incorrecto!";
//       break;
//     case "INVALID_PASSWORD":
//       errorMessage = "¡Contraseña invalida!";
//       break;
//     case "INVALID_PASSWORD":
//       errorMessage = "¡El usuario esta desabilitado!";
//       break;
//   }
//   return of(new AuthActions.AuthenticateFail(errorMessage));
// };

@Injectable()
export class AuthEffects {


  //una volta che abbiamo fatto login con successo
  authRedirect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
          this.router.navigate(["/"]);
        })
      ),
    { dispatch: false } //effetto che non da dispatchable action
  );

  //actions=big observable come stream di dispatch actions
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
}
