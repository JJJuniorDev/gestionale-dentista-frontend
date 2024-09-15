import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class UserRoleAndCalendarService {
  private isDentistSubject = new BehaviorSubject<boolean>(false);
  isDentist$ = this.isDentistSubject.asObservable();

  setIsDentist(isDentist: boolean) {
    this.isDentistSubject.next(isDentist);
  }
}