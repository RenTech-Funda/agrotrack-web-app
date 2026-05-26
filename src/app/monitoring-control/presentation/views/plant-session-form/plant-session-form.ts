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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { PlantSamplingSession, SampleAverage } from '../../../domain/model/plant-samplimg-session.entity';
import { PlantObservation } from '../../../domain/model/plant-observation.entity';

interface TempObservation {
  tempId: number;
  heightCm: number;
  leafCount: number;
  fruitCount: number;
  notes: string;
}

/**
 * Form component for creating a new plant sampling session with multiple observations.
 */
@Component({
  selector: 'app-plant-session-form',
  standalone: true,
  templateUrl: './plant-session-form.html',
  styleUrls: ['./plant-session-form.css'],
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ]
})
export class PlantSessionForm implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  readonly organizationStore = inject(OrganizationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form data
  selectedOrganizationId = signal<number | null>(null);
  selectedPlotId = signal<number | null>(null);
  availableOrganizations = signal<any[]>([]);
  availablePlots = signal<any[]>([]);
  loadingOrganizations = signal<boolean>(true);
  loadingPlots = signal<boolean>(false);
  plotsError = signal<string | null>(null);

  // Current observation being added
  currentObservation: TempObservation = {
    tempId: 0,
    heightCm: 0,
    leafCount: 0,
    fruitCount: 0,
    notes: ''
  };

  // List of observations added to session
  observations = signal<TempObservation[]>([]);
  nextTempId = 1;

  ngOnInit(): void {
    // Check if plotId was passed via query params first
    this.route.queryParams.subscribe(params => {
      const plotId = params['plotId'];
      if (plotId) {
        this.selectedPlotId.set(Number(plotId));
      }
    });

    // Load organizations by owner instead of all plots
    console.log('🔍 [Session Form] Loading organizations...');
    const profileId = parseInt(sessionStorage.getItem('profile_id') || '0', 10);

    if (profileId > 0) {
      this.organizationStore.loadOrganizationsByOwner(profileId);

      // Wait for organizations to load
      setTimeout(() => {
        const orgs = this.organizationStore.organizationsByOwner();
        const activeOrgs = orgs.filter(org => org.isActive);
        console.log('✅ [Session Form] Organizations loaded:', activeOrgs.length);
        this.availableOrganizations.set(activeOrgs);
        this.loadingOrganizations.set(false);

        // If only one organization, auto-select it
        if (activeOrgs.length === 1) {
          this.onOrganizationChange(activeOrgs[0].organizationId);
        }
      }, 500);
    } else {
      console.error('❌ [Session Form] No profile ID found');
      this.plotsError.set('No profile ID found. Please login again.');
      this.loadingOrganizations.set(false);
    }
  }

  /**
   * Handles organization selection change
   */
  onOrganizationChange(organizationId: number): void {
    console.log('🔄 [Session Form] Organization changed to:', organizationId);
    this.selectedOrganizationId.set(organizationId);
    this.selectedPlotId.set(null);
    this.loadPlotsForOrganization(organizationId);
  }

  /**
   * Loads plots for the selected organization
   */
  private loadPlotsForOrganization(organizationId: number): void {
    console.log('🔍 [Session Form] Loading plots for organization:', organizationId);
    this.loadingPlots.set(true);
    this.plotsError.set(null);

    this.organizationStore.loadPlotsByOrganization(organizationId);

    // Wait for plots to load
    setTimeout(() => {
      const plots = this.organizationStore.plotsByOrganization();
      console.log('✅ [Session Form] Plots loaded:', plots.length);
      this.availablePlots.set(plots);
      this.loadingPlots.set(false);

      // If only one plot, auto-select it
      if (plots.length === 1) {
        this.selectedPlotId.set(plots[0].plotId);
      }
    }, 500);
  }

  /**
   * Adds the current observation to the list
   */
  addObservation(): void {
    if (this.isObservationValid()) {
      this.observations.update(obs => [
        ...obs,
        { ...this.currentObservation, tempId: this.nextTempId++ }
      ]);

      // Reset current observation
      this.currentObservation = {
        tempId: 0,
        heightCm: 0,
        leafCount: 0,
        fruitCount: 0,
        notes: ''
      };
    }
  }

  /**
   * Removes an observation from the list
   */
  removeObservation(tempId: number): void {
    this.observations.update(obs => obs.filter(o => o.tempId !== tempId));
  }

  /**
   * Validates if current observation has valid data
   */
  isObservationValid(): boolean {
    return this.currentObservation.heightCm > 0 &&
           this.currentObservation.leafCount >= 0 &&
           this.currentObservation.fruitCount >= 0;
  }

  /**
   * Calculates averages from observations
   */
  getAverages(): SampleAverage | null {
    const obs = this.observations();
    if (obs.length === 0) return null;

    const avgHeightCm = obs.reduce((sum, o) => sum + o.heightCm, 0) / obs.length;
    const avgLeafCount = obs.reduce((sum, o) => sum + o.leafCount, 0) / obs.length;
    const avgFruitCount = obs.reduce((sum, o) => sum + o.fruitCount, 0) / obs.length;

    return new SampleAverage({
      avgHeightCm: Math.round(avgHeightCm * 100) / 100,
      avgLeafCount: Math.round(avgLeafCount * 100) / 100,
      avgFruitCount: Math.round(avgFruitCount * 100) / 100
    });
  }

  /**
   * Validates and submits the form
   */
  submitSession(): void {
    const plotId = this.selectedPlotId();
    const obs = this.observations();
    const averages = this.getAverages();

    if (!plotId || obs.length === 0 || !averages) {
      alert('Please select a plot and add at least one observation.');
      return;
    }

    // Create PlantObservation entities
    const plantObservations = obs.map((o, index) => new PlantObservation({
      id: 0, // Backend will assign ID
      heightCm: o.heightCm,
      leafCount: o.leafCount,
      fruitCount: o.fruitCount,
      notes: o.notes
    }));

    // Create session entity
    const session = new PlantSamplingSession({
      id: 0, // Backend will assign ID
      plotId: plotId,
      sampledAt: new Date().toISOString(),
      average: averages,
      observations: plantObservations
    });

    // Submit to store
    this.monitoringStore.createSession(session);

  }

  /**
   * Cancels and goes back
   */
  cancel(): void {
    this.router.navigate(['/sampling-sessions']);
  }
}

