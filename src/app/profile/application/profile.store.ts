import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../../iam/domain/model/user.entity';
import { ProfilesApiEndpoint } from '../infrastructure/profiles-api-endpoint';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs';

export interface Profile {
  id: number;
  profileId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly profilesApi = inject(ProfilesApiEndpoint);

  private nameSignal = signal('Usuario');
  private avatarSignal = signal<string | null>(null);
  private profilesSignal = signal<Profile[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly name = computed(() => this.nameSignal());
  readonly avatarUrl = computed(() => this.avatarSignal());
  readonly profiles = this.profilesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // --- Helpers de Usuario Actual ---
  setName(name: string) { this.nameSignal.set(name); }
  setAvatar(url: string | null) { this.avatarSignal.set(url); }

  hydrateFromUser(user: User | null) {
    if (!user) { this.reset(); return; }
    this.setName(user.name ?? this.deriveName(user.email));
    this.setAvatar(user.avatarUrl ?? null);
  }

  reset() {
    this.nameSignal.set('Usuario');
    this.avatarSignal.set(null);
    this.profilesSignal.set([]);
  }

  // --- Carga de Perfiles ---

  /**
   * Carga TODOS los perfiles (Fallback).
   */
  loadProfiles(): void {
    this.loadingSignal.set(true);
    this.profilesApi.getAll().subscribe({
      next: (resources) => {
        console.log('All profiles loaded:', resources);
        const profiles = this.mapResourcesToProfiles(resources);
        this.profilesSignal.set(profiles);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading all profiles:', err);
        // No seteamos error global para no bloquear la UI si falla el fallback
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Carga perfiles específicos por ID usando forkJoin.
   * Esta es la forma segura si el backend no soporta filtrado por query params.
   */
  loadProfilesByIds(profileIds: number[]): void {
    if (!profileIds || profileIds.length === 0) {
      this.profilesSignal.set([]);
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Creamos un array de peticiones individuales usando el método getById base
    const requests = profileIds.map(id =>
      this.profilesApi.getById(id).pipe(
        catchError(err => {
          console.error(`Error loading profile ${id}:`, err);
          return of(null); // Si uno falla, que no rompa a los demás
        })
      )
    );

    // Ejecutamos todas en paralelo
    forkJoin(requests).subscribe({
      next: (resources) => {
        // Filtramos los nulos (los que fallaron)
        const validResources = resources.filter((r): r is any => r !== null);

        console.log('Profiles loaded by IDs:', validResources);
        const profiles = this.mapResourcesToProfiles(validResources);

        this.profilesSignal.set(profiles);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Critical error loading profiles:', err);
        this.errorSignal.set('Error loading profiles');
        this.loadingSignal.set(false);
      }
    });
  }

  clearProfiles(): void {
    this.profilesSignal.set([]);
  }

  // --- Mappers ---

  private mapResourcesToProfiles(resources: any[]): Profile[] {
    return resources.map(r => ({
      id: r.id,
      profileId: r.id,
      userId: r.userId || 0,
      firstName: r.firstName,
      lastName: r.lastName,
      fullName: `${r.firstName} ${r.lastName}`,
      photoUrl: r.photoUrl
    }));
  }

  private deriveName(email: string): string {
    const base = email?.split('@')[0] ?? 'Usuario';
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Usuario';
  }
}
