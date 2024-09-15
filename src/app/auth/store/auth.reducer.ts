import { Action } from "@ngrx/store";
import { UserModel } from "../user.model";
import * as authActions from "./auth.actions";

export interface State {
  user: UserModel;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: new UserModel('1','2','3','jwt', new Date()),
  authError: '',
  loading: false,
};

export function AuthReducer(
  state = initialState,
  action: authActions.AuthActions | Action
) {
  switch (action.type) {
  case authActions.AUTHENTICATE_SUCCESS:
      // if ('payload' in action) {
      // const user = new UserModel(
      //   action.payload.email,
      //   action.payload.userId,
      //   action.payload.token,
      //   action.payload.expirationDate
      // );
      return {
         ...state,
        // authError: null,
        // user: user, //primo user è quello nella classe, secondo appena creato
        // loading: false,
      };
     //}
 
    default:
      return state;
  }
  }
   // case AuthActions.LOGOUT:
    //   return {
    //      ...state,
    //     user: null,
    //   };
    //  case AuthActions.LOGIN_START:
    //  case AuthActions.SIGN_UP_START:
    //   return {
    //      ...state,
    //     authError: null,
    //     loading: true,
    //   };
    // case AuthActions.AUTHENTICATE_FAIL:
    //   return {
    //      ...state,
    //     user: null,
    //     authError: action.payload,
    //     loading: false,
    //   };
    // case AuthActions.CLEAR_ERROR:
    //   return {
    //      ...state,
    //     authError: null,
    //   };