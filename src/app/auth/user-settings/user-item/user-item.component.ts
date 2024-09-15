import { Component, Input } from '@angular/core';
import { UserModel } from '../../user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSettingsService } from '../../userSettings.service';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css'],
})
export class UserItemComponent {
  @Input() user!: UserModel;
  @Input() index!: string;
  @Input() searchRole!: string;
  message: string = '';
  newRole: string = 'user'; // Ruolo predefinito
  selectedRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private userSettingsService: UserSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recupera l'ID dell'utente dalla rotta
    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      // Chiama il servizio per ottenere i dettagli dell'utente
      this.userSettingsService
        .getUserById(userId)
        .subscribe((userData: UserModel) => {
          this.user = userData;
        });
    }
  }

  //FUNZIONE UPDATE ROLE ------------------------------------------------------
  updateUserRole(): void {
    console.log('EMAIL:::' + this.user.email);
    this.userSettingsService.getUserByEmail(this.user.email).subscribe(
      (user) => {
        if (user.ruolo === 'dentista') {
          this.message = 'Non puoi modificare il ruolo di un dentista.';
          alert('NON PUOI MODIFICARE IL RUOLO DI UN DENTISTA');
          return;
        }

        // Controllo che un ruolo sia selezionato
        if (!this.selectedRole) {
          alert("Devi selezionare un ruolo per aggiornare l'utente.");
          return;
        }

        // Esegui l'aggiornamento solo se l'utente non è un dentista
        const updatedUser = {
          ...user,
          ruolo: this.selectedRole,
        };
        // Chiama il servizio per aggiornare i dati utente
        this.userSettingsService.updateUserData(updatedUser).subscribe({
          next: (response) => {
            console.log('Ruolo aggiornato con successo:', response);
            alert('Ruolo aggiornato con successo.');

            // Reindirizzamento alla dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error("Errore durante l'aggiornamento del ruolo:", error);
            alert("Errore durante l'aggiornamento del ruolo.");
          },
        });
      },
      (error) => {
        console.error("Errore durante la ricerca dell'utente:", error);
        this.message = 'Utente non trovato.';
      }
    );
  }

  onRoleChange(): void {
    console.log('Ruolo selezionato:', this.selectedRole);
  }
}
