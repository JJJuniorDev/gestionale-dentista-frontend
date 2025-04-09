import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  // Funzione generica per la conferma di eliminazione
  confirmDelete(message: string): Promise<boolean> {
    return Swal.fire({
      title: 'Sei sicuro?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sì, elimina',
      cancelButtonText: 'Annulla',
    }).then((result) => {
      return result.isConfirmed; // Restituisce true se l'utente ha confermato
    });
  }

  // Funzione per pop-up di successo
  success(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Successo',
      text: message,
    });
  }

  // Funzione per pop-up di errore
  error(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Errore',
      text: message,
    });
  }

  // Funzione per un pop-up informativo
  info(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Informazioni',
      text: message,
    });
  }
}
