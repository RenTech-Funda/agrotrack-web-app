import { CommonModule } from '@angular/common';
import {Component, effect, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserRole } from '../../../domain/model/user.role.enum';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {SignUpCommand} from '../../../domain/model/sign-up.command';
import {IamStore} from '../../../application/iam.store';

/**
 * @summary Component for the user registration view in the presentation layer.
 * @description Provides the user interface for creating a new account. It handles form input, validation, data adaptation (e.g., name splitting), and delegates the registration process to the IAM Store.
 * @author FloweyTech
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  roleAgronomist = false;
  roleFarmer = false;
  activeLang: 'en' | 'es' = 'en';

  public store = inject(IamStore);


  /**
   * @summary Initializes the RegisterComponent.
   * @description Sets up the default language and clears any residual session tokens from local storage to ensure a clean registration context.
   * @param router The Angular Router service for navigation.
   * @param translate The TranslateService for internationalization.
   */
  constructor(private router: Router, private translate: TranslateService) {
    this.activeLang = (localStorage.getItem('preferred-language') || 'en') as 'en' | 'es';
    this.translate.use(this.activeLang);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  /**
   * @summary Switches the application language.
   * @description Updates the active language in the translation service and persists the preference in local storage.
   * @param lang The language code to switch to ('en' or 'es').
   */
  setLanguage(lang: 'en' | 'es'): void {
    if (this.activeLang === lang) return;
    this.translate.use(lang);
    localStorage.setItem('preferred-language', lang);
    this.activeLang = lang;
  }

  /**
   * @summary Handles the registration form submission.
   * @description Validates UI inputs, adapts the single 'name' field into 'firstName' and 'lastName', determines the selected role, creates a SignUpCommand with a default photo, and delegates execution to the store.
   */
  onRegister(): void {
    // 1. Basic UI Validations
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('Todos los campos son requeridos');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!this.roleAgronomist && !this.roleFarmer) {
      alert('Debe seleccionar al menos un rol (Agronomist o Farmer)');
      return;
    }

    // 2. Data Adapter Logic
    // The backend requires firstName and lastName, but the UI form provides a single Name field.
    const nameParts = this.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.'; // Punto como fallback si es obligatorio

    //Role
    const role = this.roleAgronomist ? UserRole.AGRONOMIST : UserRole.FARMER;

    // Default placeholder photo until Profile API integration is complete
    const defaultPhoto = 'https://i.pravatar.cc/100?u=agro';

    // 3. Create command
    const signUpCommand = new SignUpCommand({
      username: this.email,
      email: this.email,
      password: this.password,
      role: role,
      firstName: firstName,
      lastName: lastName,
      photoUrl: defaultPhoto
    });

    console.log('Enviando registro:', signUpCommand);

    // 4. Delegate to Store
    this.store.signUp(signUpCommand, this.router);
  }
}
