import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam.store';

/**
 * Displays the list of environmental readings and alerts.
 */
@Component({
  selector: 'app-reading-list',
  standalone: true,
  templateUrl: './reading-list.html',
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    TranslatePipe,
    DatePipe,
    CommonModule,
    RouterLink
  ],
  styleUrls: ['./reading-list.css']
})
export class ReadingList implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  readonly organizationStore = inject(OrganizationStore);
  private readonly iamStore = inject(IamStore);
  private readonly translateService = inject(TranslateService);

  /** Columns to display in the Material table. */
  displayedColumns: string[] = ['type', 'value', 'measuredAt'];

  // Signal to store organization data with plots and readings
  organizationData = signal<any[]>([]);

  // Computed signal for active organizations
  readonly activeOrganizations = computed(() =>
    this.organizationStore.organizationsByOwner().filter(org => org.isActive)
  );

  ngOnInit(): void {
    const profileId = this.iamStore.currentUserIdValue;
    if (profileId) {
      // Load organizations by owner
      this.organizationStore.loadOrganizationsByOwner(profileId);

      // Wait for organizations to load, then load plots and readings
      setTimeout(() => {
        this.loadOrganizationsData();
      }, 500);
    }
  }

  /** Loads data for all active organizations */
  private loadOrganizationsData(): void {
    const organizations = this.organizationStore.organizationsByOwner()
      .filter(org => org.isActive);

    const orgData: any[] = [];

    organizations.forEach(org => {
      // Load plots for this organization
      this.organizationStore.loadPlotsByOrganization(org.organizationId);

      // Wait a bit for plots to load
      setTimeout(() => {
        const plots = this.organizationStore.plotsByOrganization();

        const plotsWithReadings: any[] = [];

        plots.forEach(plot => {
          // Load readings for each plot
          this.monitoringStore.loadReadingsByPlotId(plot.plotId);

          plotsWithReadings.push({
            ...plot,
            readings: [] // Will be populated by the store
          });
        });

        orgData.push({
          organization: org,
          plots: plotsWithReadings
        });

        this.organizationData.set([...orgData]);
      }, 300);
    });
  }

  /** Gets plots for a specific organization */
  getPlotsForOrganization(organizationId: number) {
    return this.organizationStore.plotsByOrganization().filter(p => p.organizationId === organizationId);
  }

  /** Gets readings for a specific plot */
  getReadingsForPlot(plotId: number) {
    // Filter readings from store by plotId
    return this.monitoringStore.readings().filter(r => r.plotId === plotId);
  }

  /** Gets the plot name by ID */
  getPlotName(plotId: number): string {
    const plots = this.organizationStore.plotsByOrganization();
    const plot = plots.find(p => p.plotId === plotId);
    return plot ? plot.plotName : '—';
  }

  /** Clears alert messages. */
  clearAlerts(): void {
    this.monitoringStore.clearAlerts();
  }

  /** Gets the CSS class for reading type badge */
  getTypeClass(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'type-temperature';
      case 'HUMIDITY': return 'type-humidity';
      case 'PH_LEVEL': return 'type-ph';
      default: return 'type-default';
    }
  }

  /** Gets the icon for reading type */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'thermostat';
      case 'HUMIDITY': return 'water_drop';
      case 'PH_LEVEL': return 'science';
      default: return 'sensors';
    }
  }

  /** Gets the icon class for reading type */
  getTypeIconClass(type: string): string {
    switch (type) {
      case 'TEMPERATURE': return 'icon-temperature';
      case 'HUMIDITY': return 'icon-humidity';
      case 'PH_LEVEL': return 'icon-ph';
      default: return 'icon-default';
    }
  }

  /** Gets the display name for reading type using translations */
  getTypeDisplayName(type: string): string {
    return this.translateService.instant(`monitoring.types.${type}`);
  }

  /** Gets relative time display using translations */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return this.translateService.instant('monitoring.time.moment');
    if (diffMins < 60) return this.translateService.instant('monitoring.time.minutes', { count: diffMins });
    if (diffHours < 24) return this.translateService.instant('monitoring.time.hours', { count: diffHours });
    if (diffDays < 7) return this.translateService.instant('monitoring.time.days', { count: diffDays });
    return this.translateService.instant('monitoring.time.week');
  }

  /** Gets CSS class for table row based on reading values */
  getRowClass(reading: any): string {
    if (this.isOutOfRange(reading)) {
      return 'row-alert';
    }
    return 'row-normal';
  }

  /** Checks if reading is out of safe range */
  private isOutOfRange(reading: any): boolean {
    switch (reading.type) {
      case 'TEMPERATURE':
        return reading.value < 10 || reading.value > 35;
      case 'HUMIDITY':
        return reading.value < 40 || reading.value > 80;
      case 'PH_LEVEL':
        return reading.value < 5.5 || reading.value > 7.5;
      default:
        return false;
    }
  }

  /** Handles row click event */
  onRowClick(reading: any): void {
    console.log('Clicked reading:', reading);
    // Future: Navigate to reading details or open edit dialog
  }
}
