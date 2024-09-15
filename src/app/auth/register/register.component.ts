import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JwtService } from '../../jwt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private service: JwtService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confermaPassword: ['', [Validators.required]],
      } //{ validator: this.passwordMathValidator }
    );
  }

  passwordMathValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confermaPassword = formGroup.get('confermaPassword')?.value;
    if (password != confermaPassword) {
      console.log('la password inserita e quella di conferma non coincidono.');
      formGroup.get('confermaPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confermaPassword')?.setErrors(null);
    }
  }

  submitForm() {
    if (this.registerForm.valid) {
      this.service.register(this.registerForm.value).subscribe(
        (response) => {
          console.log('Response received from backend:', response);
          if (response.id != null) {
            alert(
              'Ciao ' +
                response.username +
                ', registrazione avvenuta con successo!'
            );
            console.log('registrazione successa');
            localStorage.removeItem('jwt');
            this.router.navigateByUrl('/login');
          } else {
            alert('Errore: Registrazione fallita.');
          }
        },
        (error) => {
          console.error('Errore di registrazione:', error);
          alert('Errore di registrazione. Si prega di riprovare.');
        }
      );
    } else {
      console.error('Il modulo di registrazione non è valido');
      alert(
        'Il modulo di registrazione non è valido. Si prega di correggere gli errori e riprovare.'
      );
    }
  }
}
