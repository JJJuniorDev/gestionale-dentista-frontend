import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServizioDentale } from "./servizio-dentale.model";

@Injectable({
  providedIn: 'root',
})
export class ServiziDentaliService {
  private jsonUrl = 'assets/servizi-dentali.json';

  constructor(private http: HttpClient) {}

  getServiziDentali(): Observable<ServizioDentale[]> {
    return this.http.get<ServizioDentale[]>(this.jsonUrl);
  }
}
