export class UserModel {
  constructor(
    public email: string,
    public id: string,
    public ruolo: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}
 

  get token() {
    //proprietà con codice
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }

  getRuolo(){
    return this.ruolo;
  }

}
