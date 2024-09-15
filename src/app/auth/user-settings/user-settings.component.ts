
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserModel } from '../user.model';
import { AuthService } from '../auth.service';
import { UserSettingsService } from '../userSettings.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
})
export class UserSettingsComponent implements OnInit {
  userForm!: FormGroup;
  user!: UserModel;
  passwordError: string | null = null; // Error handling for password
  currentPage: number = 1; // Pagina corrente
  itemsPerPage: number = 2; // Numero di utenti per pagina

  //SEZIONE UPDATE USER ROLE VARIABILI
  selectedEmail: string = '';
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  selectedParameter: string = 'user';
  searchValue: string = '';
  searchRole!: string;
  paginatedUsers: UserModel[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userSettingsService: UserSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUserFromToken()!;

    // Inizializza il form con i dati dell'utente
    this.userForm = this.fb.group({
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      ruolo: [{ value: this.user?.ruolo || '', disabled: true }],
      id: [{ value: this.user.id }],
      currentPassword: ['', Validators.required], // Campo password corrente
      newPassword: ['', Validators.minLength(6)], // Campo nuova password (non obbligatorio)
    });
    this.userSettingsService.getAllUsers().subscribe(
      (users: UserModel[]) => {
        this.users = users;
        this.filteredUsers = users;
        this.updatePaginatedResults(); // Applica subito la paginazione
      },
      (error) => {
        console.error('Errore nel recupero degli utenti:', error);
      }
    );
  }

  // Funzione per salvare i dati aggiornati
  onSaveUserData(): void {
    if (this.userForm.valid) {
      console.log('id User' + this.user.id);
      const updatedUserData: {
        email: string;
        id: string;
        ruolo: string;
        newPassword?: string; // opzionale
        currentPassword?: string; // opzionale
      } = {
        email: this.userForm.get('email')?.value,
        id: this.user.id,
        ruolo: this.userForm.get('ruolo')?.value,
      };
      // Controlla se l'utente ha fornito una nuova password
      if (this.userForm.get('newPassword')?.value) {
        updatedUserData.newPassword = this.userForm.get('newPassword')?.value;
        updatedUserData.currentPassword =
          this.userForm.get('currentPassword')?.value;
      }
      this.userSettingsService.updateUserData(updatedUserData).subscribe({
        next: (updatedUser) => {
          console.log('Dati aggiornati con successo', updatedUser);
          // Puoi anche aggiornare il token JWT o gestire altri comportamenti qui
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (
            err.status === 400 &&
            err.error.message === 'Incorrect password'
          ) {
            this.passwordError = 'La password corrente è errata';
          } else {
            console.error("Errore durante l'aggiornamento dei dati", err);
          }
        },
      });
    }
  }

  onSearch() {
    // Prima di tutto, controlla se abbiamo utenti da filtrare
    if (!this.users || this.users.length === 0) {
      console.log('Nessun utente trovato per la ricerca.');
      return;
    }
    let filtered = this.users;

    if (this.selectedParameter === 'ruolo' && this.searchRole) {
      console.log('in onsearch');
      // this.filteredUsers = this.users.filter((user) =>
      filtered = filtered.filter((user) =>
        user.ruolo.toLowerCase().includes(this.searchRole.toLowerCase())
      );
    }
    // Filtra per email se selezionato come parametro
    if (this.selectedParameter === 'email' && this.searchValue) {
      //    this.filteredUsers = this.filteredUsers.filter((user) =>
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(this.searchValue.toLowerCase())
      );
    }
    this.filteredUsers = filtered;
    this.currentPage = 1; // Ripristina la pagina alla prima dopo la ricerca
    this.updatePaginatedResults();
  }

  updatePaginatedResults() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
   this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredUsers.length) {
      this.currentPage++;
      this.updatePaginatedResults();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedResults();
    }
  }

  hasNextPage(): boolean {
    // Controlla se ci sono altre pagine dopo quella corrente
    return this.currentPage * this.itemsPerPage < this.filteredUsers.length;
  }

  hasPreviousPage(): boolean {
    // Controlla se non siamo già alla prima pagina
    return this.currentPage > 1;
  }

  navigateToUserRole(userId: string): void {
    this.router.navigate([`/users/${userId}`]);
  }
}
