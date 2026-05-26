import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {SignInCommand} from '../../../domain/model/sign-in.command';

/**
 * @summary Component for the user sign-in view in the presentation layer.
 * @description Provides the user interface for entering credentials (email and password), handling language preferences, and initiating the authentication process by interacting with the IAM Store.
 * @author FloweyTech
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  activeLang = 'en';


  public store = inject(IamStore);

  /**
   * @summary Initializes the LoginComponent.
   * @description Sets up the default language based on local storage and clears any existing session to ensure a fresh login state.
   * @param router The Angular Router service for navigation.
   * @param translate The TranslateService for internationalization.
   */
  constructor(private router: Router, private translate: TranslateService) {
    this.activeLang = (localStorage.getItem('preferred-language') || 'en') as 'en' | 'es';
    this.translate.use(this.activeLang);

    // Clears the session upon entry to ensure a clean state.
    this.store.signOut(this.router);

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
   * @summary Handles the sign-in form submission.
   * @description Validates the input fields, creates a SignInCommand, and delegates the authentication process to the IamStore.
   */
  onLogin(): void {
    if (!this.email || !this.password) {
      console.error('Email y password son requeridos');
      return;
    }

    // Create the command object
    const signInCommand = new SignInCommand({
      identifier: this.email,
      password: this.password
    });

    // Delegate execution to the store
    this.store.signIn(signInCommand, this.router);
  }
}
