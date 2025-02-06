import { Injectable, Injector } from '@angular/core';
// import { ShoppingListService } from "../shopping-list/shopping-list.service";
import {
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppuntamentoDTO } from './appuntamentoDTO.model';
import { PazienteService } from '../pazienti/paziente.service';

@Injectable()
export class AppuntamentoService {
  appuntamentiChanged = new Subject<AppuntamentoDTO[]>();
  private appuntamenti: AppuntamentoDTO[] = [];
  private apiUrl = environment.appuntamentoMicroserviceUrl;
  private pazienteService!: PazienteService; // Dichiarazione senza inizializzazione

  constructor(
    private http: HttpClient,
    private injector: Injector // Aggiungiamo l'injector per il Lazy Injection
  ) {}

  private getPazienteService(): PazienteService {
    if (!this.pazienteService) {
      this.pazienteService = this.injector.get(PazienteService); // Inizializziamo solo al bisogno
    }
    return this.pazienteService;
  }

  setAppuntamenti(appuntamenti: AppuntamentoDTO[]) {
    this.appuntamenti = appuntamenti;
    //perchè adesso abbiamo nuovi pazienti creiamo copia nuova
    this.appuntamentiChanged.next(this.appuntamenti.slice());
  }

  getAppuntamentiPerDottore(
    dottoreId: string
  ): Observable<AppuntamentoDTO[]> {
    return this.http.get<AppuntamentoDTO[]>(
      `${this.apiUrl}/dottore/${dottoreId}`
    );
  }

  getAppuntamentiByIds(
    appuntamentiIds: string[]
  ): Observable<AppuntamentoDTO[]> {
    return this.http
      .post<AppuntamentoDTO[]>(`${this.apiUrl}/by-ids`, appuntamentiIds)
      .pipe(
        map((appuntamenti) => {
          console.log('Appuntamenti ritornati dal servizio:', appuntamenti); // Stampa gli appuntamenti nella console
          return appuntamenti;
        }),
        catchError((error) => {
          console.error('Errore nel recupero degli appuntamenti:', error);
          return throwError(
            () => new Error('Errore nel recupero degli appuntamenti.')
          );
        })
      );
  }

  getAppuntamenti(): Observable<AppuntamentoDTO[]> {
    return this.http.get<AppuntamentoDTO[]>(this.apiUrl).pipe(
      map((data) => {
        if (!data) {
          return [];
        }
        return data.map((item) => ({
          ...item,
          data: new Date(item.dataEOrario),
        }));
      })
    );
  }

  getAppuntamento(id: string): Observable<AppuntamentoDTO> {
    return this.http.get<AppuntamentoDTO>(`${this.apiUrl}/${id}`).pipe(
      map((appuntamento: AppuntamentoDTO) => {
        if (!appuntamento) {
          throw new Error(`Appuntamento con ID ${id} non trovato.`);
        }
        return appuntamento;
      }),
      catchError((error) => {
        console.error("Errore durante la richiesta dell'appuntamento:", error);
        return throwError(
          () =>
            new Error("Impossibile ottenere l'appuntamento: " + error.message)
        );
      })
    );
  }

  // addAppuntamento(appuntamento: AppuntamentoDTO) {
  //   this.http
  //     .post<AppuntamentoDTO>(this.apiUrl, appuntamento)
  //     .subscribe((nuovoAppuntamento) => {
  //       this.appuntamenti.push(nuovoAppuntamento);
  //       this.appuntamentiChanged.next(this.appuntamenti.slice());
  //     });
  // }

  addAppuntamento(
    appuntamento: AppuntamentoDTO,
    pazienteId: string
  ): Promise<AppuntamentoDTO> {
    console.log('PAZIENTE ID: ' + pazienteId);
    appuntamento.pazienteId = pazienteId;
    console.log(' appuntamento.pazienteId: ' + appuntamento.pazienteId);
    return new Promise((resolve, reject) => {
      // Effettua la richiesta per creare l'appuntamento
      this.http.post<{ id: string }>(this.apiUrl, appuntamento).subscribe(
        (response) => {
          const appuntamentoId = response.id;

          const nuovoAppuntamento = {
            ...appuntamento,
            id: appuntamentoId,
          };
          this.appuntamenti.push(nuovoAppuntamento); // Aggiungi l'appuntamento alla lista locale
          this.appuntamentiChanged.next(this.appuntamenti.slice());
          const pazienteService = this.getPazienteService(); // Lazy Loading del servizio
          // Ora, aggiorna il paziente con l'ID dell'appuntamento creato
          const sub = pazienteService.updatePazienteAppuntamenti(
            pazienteId,
            appuntamentoId
          );
          console.log('Paziente aggiornato con il nuovo appuntamento');
          resolve(nuovoAppuntamento);
          sub.unsubscribe(); // Se non ti serve tenerlo attivo
        },
        (error) => {
          console.error("Errore nella creazione dell'appuntamento:", error);
          reject(error); // Rifiuta la Promise in caso di errore
        }
      );
    });
  }

  updateAppuntamento(
    id: string,
    newAppuntamento: AppuntamentoDTO
  ): Observable<AppuntamentoDTO> {
    return this.http.put<AppuntamentoDTO>(
      `${this.apiUrl}/${id}`,
      newAppuntamento
    );
    // .subscribe((updatedAppuntamento) => {
    //   const index = this.appuntamenti.findIndex((a) => a.id === id);
    //   if (index !== -1) {
    //     this.appuntamenti[index] = updatedAppuntamento;
    //     this.appuntamentiChanged.next(this.appuntamenti.slice());
    //   }
    // });
  }

  deleteAppuntamento(index: string): Observable<void> {
    // const id = this.appuntamenti[+index].id;
    return this.http.delete<void>(`${this.apiUrl}/${index}`);
  }

  deleteAppuntamentoLocally(index: number): void {
    this.appuntamenti.splice(index, 1);
    this.appuntamentiChanged.next(this.appuntamenti.slice());
  }

  // Metodo per rimuovere l'appuntamento dal paziente
  removeAppuntamentoFromPaziente(
    pazienteId: string,
    appuntamentoId: string
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/pazienti/${pazienteId}/removeAppuntamento`,
      {
        appuntamentoId: appuntamentoId,
      }
    );
  }

  getAppuntamentiFuturi(): Observable<AppuntamentoDTO[]> {
    return this.http.get<AppuntamentoDTO[]>(`${this.apiUrl}/upcoming`);
    // const today = new Date(); // Data e ora attuale
    // const todayUTC = new Date(
    //   Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    // ); // Normalizzazione a mezzanotte in UTC

    // return this.getAppuntamenti().pipe(
    //   map((appuntamenti) => {
    //     return appuntamenti.filter((appuntamento) => {
    //       const appointmentDate = new Date(appuntamento.dataEOrario); // Converte la data dell'appuntamento
    //       // Controllo che l'appuntamento sia successivo alla data di oggi (UTC)
    //       return appointmentDate > todayUTC;
    //     });
    //   })
    // );
  }

  updateAppuntamentoStato(appuntamentoId: string, nuovoStato: string) {
    return this.http.put(
      `${this.apiUrl}/${appuntamentoId}/updateStatus`,
      nuovoStato,
      {
        headers: { 'Content-Type': 'text/plain' },
      }
    );
  }
}
