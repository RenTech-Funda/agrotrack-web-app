import {computed, Injectable, signal} from '@angular/core';
import {SignInCommand} from '../domain/model/sign-in.command';
import {Router} from '@angular/router';
import {IamApi} from '../infrastructure/iam-api';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {UserRole} from '../domain/model/user.role.enum';

/**
 * @summary Application service store for managing Identity and Access Management state.
 * @description Handles user authentication, sign-in, sign-up.
 * @author FloweyTech
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  // --- Signals de Estado ---
  private readonly isSignedInSignal = signal<boolean>(false);
  private readonly currentUsernameSignal = signal<string | null>(null);
  private readonly currentUserIdSignal = signal<number | null>(null);
  private readonly currentRoleSignal = signal<string | null>(null);

  // --- Signal de Carga (¡Esto es lo que faltaba!) ---
  private readonly loadingUsersSignal = signal<boolean>(false);

  // --- Readonlys Públicos (Para usar en el HTML) ---
  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  readonly currentRole = this.currentRoleSignal.asReadonly();

  // Aquí exponemos el estado de carga para tus botones [disabled]
  readonly isLoadingUsers = this.loadingUsersSignal.asReadonly();

  readonly currentToken = computed(() => this.isSignedIn() ? localStorage.getItem('token') : null);

  // --- Helpers ---
  readonly isAgronomist = computed(() => this.currentRoleSignal() === UserRole.AGRONOMIST);
  readonly isFarmer = computed(() => this.currentRoleSignal() === UserRole.FARMER);

  get currentUserIdValue(): number | null {
    return this.currentUserIdSignal();
  }

  constructor(private iamApi: IamApi) {
    // Recuperar sesión al recargar (F5)
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const savedId = sessionStorage.getItem('profile_id');

    if (token) {
      this.isSignedInSignal.set(true);
      if(role) this.currentRoleSignal.set(role);
      if(savedId) this.currentUserIdSignal.set(Number(savedId));
    }
  }

  /**
   * Sign In
   */
  signIn(signInCommand: SignInCommand, router: Router) {
    this.loadingUsersSignal.set(true); // Activar spinner/bloqueo

    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        // Guardar datos
        localStorage.setItem('token', signInResource.token);
        localStorage.setItem('role', signInResource.role);
        sessionStorage.setItem('profile_id', signInResource.id.toString());

        // Actualizar estado
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.username);
        this.currentUserIdSignal.set(signInResource.id);
        this.currentRoleSignal.set(signInResource.role);

        this.loadingUsersSignal.set(false); // Desactivar spinner
        router.navigate(['/organization']).then();
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.loadingUsersSignal.set(false); // Desactivar spinner
        this.signOut(router);
      }
    });
  }

  /**
   * Sign Up
   */
  signUp(signUpCommand: SignUpCommand, router: Router) {
    this.loadingUsersSignal.set(true); // Activar spinner/bloqueo

    this.iamApi.signUp(signUpCommand).subscribe({
      next: (signUpResource) => {
        console.log('Sign-up successful:', signUpResource);
        this.loadingUsersSignal.set(false); // Desactivar spinner
        router.navigate(['/login']).then();
      },
      error: (err) => {
        console.error('Sign-up failed:', err);
        this.loadingUsersSignal.set(false); // Desactivar spinner
        router.navigate(['/register']).then();
      }
    });
  }

  /**
   * Sign Out
   */
  signOut(router: Router) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('profile_id');

    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
    this.currentRoleSignal.set(null);

    router.navigate(['/login']).then();
  }
}
