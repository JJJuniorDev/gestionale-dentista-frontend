import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserItemComponent } from './user-settings/user-item/user-item.component';
import { AuthService } from './auth.service';
import { UserSettingsService } from './userSettings.service';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    UserSettingsComponent,
    UserItemComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        children: [
          {
            path: '',
            redirectTo: 'login',
            pathMatch: 'full',
          }, // Reindirizza a /auth/login per impostazione predefinita
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterComponent },
          { path: 'users', component: UserSettingsComponent },
          {path: 'users/:id', component: UserItemComponent}
        ],
      },
    ]),
    SharedModule,
  ],

  providers: [AuthService, UserSettingsService],
})
export class AuthModule {}
