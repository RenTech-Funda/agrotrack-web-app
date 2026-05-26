import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonitoringStore } from '../../../application/monitoring-control.store';

/**
 * Displays detailed information about a specific plant sampling session.
 */
@Component({
  selector: 'app-plant-session-detail',
  standalone: true,
  templateUrl: './plant-session-detail.html',
  styleUrls: ['./plant-session-detail.css'],
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ]
})
export class PlantSessionDetail implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  sessionId = signal<number | null>(null);
  displayedColumns: string[] = ['id', 'heightCm', 'leafCount', 'fruitCount', 'notes', 'actions'];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.sessionId.set(id);
        this.monitoringStore.loadSessionById(id);
        this.monitoringStore.loadObservationsBySession(id);
      }
    });
  }

  /**
   * Gets the current session from the store
   */
  get currentSession() {
    const id = this.sessionId();
    if (!id) return null;
    return this.monitoringStore.sessions().find(s => s.id === id);
  }

  /**
   * Formats date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  /**
   * Navigates to add observation form
   */
  addObservation(): void {
    const id = this.sessionId();
    if (id) {
      this.router.navigate(['/sampling-sessions', id, 'observations', 'new']);
    }
  }

  /**
   * Navigates to edit observation form
   */
  editObservation(observationId: number): void {
    const id = this.sessionId();
    if (id) {
      this.router.navigate(['/sampling-sessions', id, 'observations', observationId, 'edit']);
    }
  }

  /**
   * Deletes an observation
   */
  deleteObservation(observationId: number): void {
    const id = this.sessionId();
    if (id && confirm('Are you sure you want to delete this observation?')) {
      this.monitoringStore.deleteObservation(id, observationId);
    }
  }

  /**
   * Navigates back to list
   */
  goBack(): void {
    this.router.navigate(['/monitoring/plant-sessions']);
  }

  /**
   * Deletes the entire session
   */
  deleteSession(): void {
    const id = this.sessionId();
    if (id && confirm('Are you sure you want to delete this entire session?')) {
      this.monitoringStore.deleteSession(id);
      this.router.navigate(['/sampling-sessions']);
    }
  }
}

