import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { JwtService } from '../../jwt.service';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showLogin: boolean = false;

  constructor(
    private service: JwtService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], //, [this.asyncValidator.bind(this)]
      password: ['', Validators.required],
    });
  }

  submitForm() {
    if (this.loginForm.valid) {
      console.log('In submit form del login');
      this.service.login(this.loginForm.value).subscribe(
        (response) => {
          console.log(response);
          if (response.jwt != null) {
            alert('Hello, Your token is ' + response.jwt);
            const jwtToken = response.jwt;
            localStorage.setItem('jwt', jwtToken);
            this.authService.login(jwtToken); // Aggiorna il ruolo dell'utente
            const dottoreId = this.authService.getUserId();
            this.router.navigateByUrl(`/appuntamenti/dottore/${dottoreId}`);
          }
        },
        (error) => {
          console.error('Login error:', error);
        }
      );
    } else {
      console.error('Form is invalid');
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }



   features = [
    {
      title: 'Gestione Appuntamenti',
      description: 'Organizza le visite, imposta promemoria e ricevi notifiche.',
      image: 'assets/paz1.png'
    },
    {
      title: 'Pazienti e Trattamenti',
      description: 'Gestisci il profilo di ogni paziente con storico, piani di cura e note cliniche.',
      image: 'assets/piano1.png'
    },
    {
      title: 'Database Farmaci',
      description: 'Consulta rapidamente le schede dei farmaci e le interazioni.',
      image: 'assets/farmaci1.png'
    },
    {
      title: 'Note Cliniche',
      description: 'Prendi appunti dettagliati e tieni traccia di ogni seduta.',
      image: 'assets/nota1.png'
    }
  ];

  // Variabili per gestire la modale
  showModal = false;
  currentImage: string = '';

  // Funzione per aprire l'immagine nella modale
  openImage(imageSrc: string) {
    this.currentImage = imageSrc;
    this.showModal = true;
  }

  // Funzione per chiudere la modale
  closeModal() {
    this.showModal = false;
  }
}

