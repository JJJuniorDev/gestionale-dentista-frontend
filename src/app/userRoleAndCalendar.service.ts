import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class UserRoleAndCalendarService {
  private isDoctorSubject = new BehaviorSubject<boolean>(false);
  isDoctor$ = this.isDoctorSubject.asObservable();

  setIsDoctor(isDoctor: boolean) {
    this.isDoctorSubject.next(isDoctor);
  }
}