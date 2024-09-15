import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth.reducer';
import { AuthActions } from './auth.actions';



export interface AppState {
  auth: fromAuth.State;
}

export const appReducer: ActionReducerMap<AppState> = {
     auth: fromAuth.AuthReducer
}

