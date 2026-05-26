import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IamStore } from '../../../iam/application/iam.store';

interface ProfileData {
  id: number;
  profileId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly iamStore = inject(IamStore);

  profileForm!: FormGroup;
  photoForm!: FormGroup;
  profile: ProfileData | null = null;
  loading = false;
  profileId: number | null = null;

  get firstNameControl() {
    return this.profileForm.get('firstName');
  }

  get lastNameControl() {
    return this.profileForm.get('lastName');
  }

  get photoUrlControl() {
    return this.photoForm.get('photoUrl');
  }

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.photoForm = this.fb.group({
      photoUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }


  private loadProfile(): void {
    this.profileId = this.iamStore.currentUserIdValue;

    if (!this.profileId) return;

    this.loading = true;
    const url = `${environment.platformProviderApiBaseUrl}/profiles/${this.profileId}`;

    this.http.get<ProfileData>(url).subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName
        });
        this.photoForm.patchValue({
          photoUrl: data.photoUrl
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.loading = false;
      }
    });
  }

  updateName(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const url = `${environment.platformProviderApiBaseUrl}/profiles/${this.profileId}/person-name`;
    const body = this.profileForm.value;

    this.http.put(url, body).subscribe({
      next: () => {
        this.loadProfile();
        alert('Nombre actualizado correctamente');
      },
      error: (err) => {
        console.error('Error updating name:', err);
        alert('Error al actualizar el nombre');
        this.loading = false;
      }
    });
  }

  updatePhoto(): void {
    if (this.photoForm.invalid) {
      this.photoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const url = `${environment.platformProviderApiBaseUrl}/profiles/${this.profileId}/photo-url`;
    const body = this.photoForm.value;

    this.http.put(url, body).subscribe({
      next: () => {
        this.loadProfile();
        alert('Foto actualizada correctamente');
      },
      error: (err) => {
        console.error('Error updating photo:', err);
        alert('Error al actualizar la foto');
        this.loading = false;
      }
    });
  }

  cancelNameEdit(): void {
    this.profileForm.patchValue({
      firstName: this.profile?.firstName,
      lastName: this.profile?.lastName
    });
  }

  cancelPhotoEdit(): void {
    this.photoForm.patchValue({
      photoUrl: this.profile?.photoUrl
    });
  }
}
