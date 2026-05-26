import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { PlantObservation } from '../../../domain/model/plant-observation.entity';

/**
 * Form component for adding or editing a single plant observation.
 */
@Component({
  selector: 'app-plant-observation-form',
  standalone: true,
  templateUrl: './plant-observation-form.html',
  styleUrls: ['./plant-observation-form.css'],
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class PlantObservationForm implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  sessionId = signal<number | null>(null);
  observationId = signal<number | null>(null);
  isEditMode = signal<boolean>(false);

  // Form data
  formData = {
    heightCm: 0,
    leafCount: 0,
    fruitCount: 0,
    notes: ''
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sessionId = Number(params['sessionId']);
      const observationId = params['observationId'];

      if (sessionId) {
        this.sessionId.set(sessionId);
      }

      if (observationId && observationId !== 'new') {
        this.observationId.set(Number(observationId));
        this.isEditMode.set(true);
        this.loadObservation(Number(observationId));
      }
    });
  }

  /**
   * Loads observation data for editing
   */
  private loadObservation(observationId: number): void {
    const sessionId = this.sessionId();
    if (sessionId) {
      this.monitoringStore.loadObservationsBySession(sessionId);

      setTimeout(() => {
        const observation = this.monitoringStore.observations()
          .find(o => o.id === observationId);

        if (observation) {
          this.formData = {
            heightCm: observation.heightCm,
            leafCount: observation.leafCount,
            fruitCount: observation.fruitCount,
            notes: observation.notes
          };
        }
      }, 500);
    }
  }

  /**
   * Validates form data
   */
  isFormValid(): boolean {
    return this.formData.heightCm > 0 &&
           this.formData.leafCount >= 0 &&
           this.formData.fruitCount >= 0;
  }

  /**
   * Submits the form
   */
  submitForm(): void {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    const sessionId = this.sessionId();
    if (!sessionId) return;

    const observation = new PlantObservation({
      id: this.observationId() || 0,
      heightCm: this.formData.heightCm,
      leafCount: this.formData.leafCount,
      fruitCount: this.formData.fruitCount,
      notes: this.formData.notes
    });

    if (this.isEditMode()) {
      const observationId = this.observationId();
      if (observationId) {
        this.monitoringStore.updateObservation(sessionId, observationId, observation);
      }
    } else {
      this.monitoringStore.createObservation(sessionId, observation);
    }

    // Wait a bit and navigate back
    setTimeout(() => {
      this.goBack();
    }, 1000);
  }

  /**
   * Cancels and goes back
   */
  cancel(): void {
    this.goBack();
  }

  /**
   * Navigates back to session detail
   */
  private goBack(): void {
    const sessionId = this.sessionId();
    if (sessionId) {
      this.router.navigate(['/sampling-sessions', sessionId]);
    } else {
      this.router.navigate(['/sampling-sessions']);
    }
  }
}

