import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpProgressEvent,
  HttpEventType,
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
 
  constructor(
    private spinner: NgxSpinnerService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinner.show(); // Mostra lo spinner all'inizio della richiesta

    return next.handle(req.clone({ reportProgress: true })).pipe(
      tap((event) => {
        // ✅ Controlliamo se l'evento è di progresso (upload o download)
        if (event instanceof HttpResponse) {
          this.spinner.hide();
        }
      })
    );
  }
}
