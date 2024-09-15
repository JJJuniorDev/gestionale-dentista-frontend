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
      this.service.login(this.loginForm.value).subscribe(
        (response) => {
          console.log(response);
          if (response.jwt != null) {
            alert('Hello, Your token is ' + response.jwt);
            const jwtToken = response.jwt;
            localStorage.setItem('jwt', jwtToken);
            this.authService.login(jwtToken); // Aggiorna il ruolo dell'utente
            this.router.navigateByUrl('/dashboard');
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
}
