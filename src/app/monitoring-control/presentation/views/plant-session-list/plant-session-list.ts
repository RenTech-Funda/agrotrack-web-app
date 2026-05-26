import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { OrganizationApi } from '../../../../organization/infrastructure/organization-api';
import { IamStore } from '../../../../iam/application/iam.store';

/**
 * Displays the list of plant sampling sessions grouped by plot.
 */
@Component({
  selector: 'app-plant-session-list',
  standalone: true,
  templateUrl: './plant-session-list.html',
  styleUrls: ['./plant-session-list.css'],
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule
  ]
})
export class PlantSessionList implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);
  private readonly organizationApi = inject(OrganizationApi);
  readonly organizationStore = inject(OrganizationStore);
  private readonly iamStore = inject(IamStore);
  private readonly translate = inject(TranslateService);

  // Computed signal for active organizations
  readonly activeOrganizations = computed(() =>
    this.organizationStore.organizationsByOwner().filter(org => org.isActive)
  );

  // Signal local para almacenar parcelas agrupadas por organización
  plotsByOrganizationMap = signal<Map<number, any[]>>(new Map());

  ngOnInit(): void {
    const profileId = this.iamStore.currentUserIdValue;
    if (profileId) {
      // Load organizations by owner
      this.organizationStore.loadOrganizationsByOwner(profileId);

      // Wait for organizations to load, then load plots and sessions
      setTimeout(() => {
        this.loadOrganizationsData();
      }, 500);
    }
  }

  /**
   * Loads data for all active organizations
   */
  private async loadOrganizationsData(): Promise<void> {
    const organizations = this.organizationStore.organizationsByOwner()
      .filter(org => org.isActive);

    console.log('Loading data for organizations:', organizations.map(o => ({ id: o.organizationId, name: o.organizationName })));

    // Cargar parcelas de cada organización SECUENCIALMENTE
    for (const org of organizations) {
      await this.loadPlotsForOrganization(org.organizationId);
    }
  }

  /**
   * Loads plots for a specific organization using direct API call
   */
  private loadPlotsForOrganization(organizationId: number): Promise<void> {
    return new Promise((resolve) => {
      console.log(`🔍 Loading plots for organization ${organizationId}...`);

      // Usar la API directamente en lugar del store compartido
      this.organizationApi.getPlotsByOrganization(organizationId).subscribe({
        next: (plots) => {
          console.log(`✅ Loaded ${plots.length} plots for org ${organizationId}:`, plots.map(p => p.plotName));

          // Store plots in local Map
          this.plotsByOrganizationMap.update(map => {
            const newMap = new Map(map);
            newMap.set(organizationId, [...plots]);
            return newMap;
          });

          // Load sessions for each plot
          plots.forEach(plot => {
            this.monitoringStore.loadSessionsByPlot(plot.plotId);
          });

          resolve();
        },
        error: (err) => {
          console.error(`❌ Error loading plots for org ${organizationId}:`, err);
          // En caso de error, guardar array vacío
          this.plotsByOrganizationMap.update(map => {
            const newMap = new Map(map);
            newMap.set(organizationId, []);
            return newMap;
          });
          resolve(); // Resolver de todas formas para continuar con otras orgs
        }
      });
    });
  }

  /**
   * Gets plots for a specific organization
   */
  getPlotsForOrganization(organizationId: number) {
    return this.plotsByOrganizationMap().get(organizationId) || [];
  }

  /**
   * Gets sessions for a specific plot
   */
  getSessionsForPlot(plotId: number) {
    return this.monitoringStore.sessions().filter(s => s.plotId === plotId);
  }

  /**
   * Formats date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Navigates to session detail
   */
  viewSessionDetail(sessionId: number): void {
    // Navigation will be handled by RouterLink in template
  }

  /**
   * Deletes a session
   */
  deleteSession(sessionId: number, event: Event): void {
    event.stopPropagation();
    const confirmMessage = this.translate.instant('plantSessions.deleteConfirm');
    if (confirm(confirmMessage)) {
    if (confirm(confirmMessage)) {
      this.monitoringStore.deleteSession(sessionId);
    }
  }
  }
}

