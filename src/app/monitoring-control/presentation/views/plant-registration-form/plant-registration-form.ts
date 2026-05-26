import { Component, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { OrganizationApi } from '../../../../organization/infrastructure/organization-api';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { IamStore } from '../../../../iam/application/iam.store';

interface Plant {
  id?: number;
  tempId?: number;
  height: number;
  leaves: number;
  fruits: number;
  date: string;
  plotId?: number;
}

interface PlantAverage {
  height: number;
  leaves: number;
  fruits: number;
  date: string;
  plantsCount: number;
}

@Component({
  selector: 'app-plant-registration-form',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './plant-registration-form.html',
  styleUrl: './plant-registration-form.css'
})
export class PlantRegistrationForm implements OnInit {
  private readonly organizationApi = inject(OrganizationApi);
  private readonly organizationStore = inject(OrganizationStore);
  private readonly iamStore = inject(IamStore);

  currentPlant: Plant = { height: 0, leaves: 0, fruits: 0, date: '', plotId: undefined };
  sessionPlants: Plant[] = [];
  sessionAverage: PlantAverage | null = null;

  // Signals para organizaciones y parcelas
  organizations = signal<any[]>([]);
  plots = signal<any[]>([]);
  selectedOrganizationId = signal<number | undefined>(undefined);
  loading = signal(false);

  // Computed para organizaciones activas
  activeOrganizations = computed(() =>
    this.organizations().filter(org => org.isActive)
  );

  @Output() plantAdded = new EventEmitter<Plant>();

  ngOnInit(): void {
    this.loadOrganizations();
  }

  private loadOrganizations(): void {
    const profileId = this.iamStore.currentUserIdValue;
    console.log('🔍 [Plant Form] Loading organizations for profileId:', profileId);

    if (profileId) {
      this.loading.set(true);
      this.organizationApi.getOrganizationsByOwner(profileId).subscribe({
        next: (orgs) => {
          console.log('✅ [Plant Form] Organizations loaded:', orgs);
          this.organizations.set(orgs);
          this.loading.set(false);

          // Si solo hay una organización activa, seleccionarla automáticamente
          const activeOrgs = orgs.filter(org => org.isActive);
          console.log('📋 [Plant Form] Active organizations:', activeOrgs);

          if (activeOrgs.length === 1) {
            console.log('🎯 [Plant Form] Auto-selecting organization:', activeOrgs[0].organizationId);
            this.onOrganizationChange(activeOrgs[0].organizationId);
          }
        },
        error: (err) => {
          console.error('❌ [Plant Form] Error loading organizations:', err);
          this.loading.set(false);
        }
      });
    } else {
      console.warn('⚠️ [Plant Form] No profileId available');
    }
  }

  onOrganizationChange(organizationId: number): void {
    console.log('🔄 [Plant Form] Organization changed to:', organizationId);
    this.selectedOrganizationId.set(organizationId);
    this.currentPlant.plotId = undefined;
    this.loadPlots(organizationId);
  }

  private loadPlots(organizationId: number): void {
    console.log('🔍 [Plant Form] Loading plots for organization:', organizationId);
    this.loading.set(true);

    this.organizationApi.getPlotsByOrganization(organizationId).subscribe({
      next: (plots) => {
        console.log('✅ [Plant Form] Plots loaded:', plots);
        this.plots.set(plots);
        this.loading.set(false);

        // Si solo hay una parcela, seleccionarla automáticamente
        if (plots.length === 1) {
          console.log('🎯 [Plant Form] Auto-selecting plot:', plots[0].plotId);
          this.currentPlant.plotId = plots[0].plotId;
        }
      },
      error: (err) => {
        console.error('❌ [Plant Form] Error loading plots:', err);
        this.loading.set(false);
        this.plots.set([]); // Limpiar parcelas en caso de error
      }
    });
  }

  addPlantToSession() {
    if (this.isValidPlant(this.currentPlant)) {
      const plantWithTempId = {
        ...this.currentPlant,
        tempId: Date.now() + Math.random()
      };
      this.sessionPlants.push(plantWithTempId);

      // Mantener el plotId seleccionado pero resetear los demás campos
      const plotId = this.currentPlant.plotId;
      this.resetCurrentPlant();
      this.currentPlant.plotId = plotId;

      this.sessionAverage = null; // Reset average when adding new plant
    }
  }

  private isValidPlant(plant: Plant): boolean {
    return plant.height > 0 &&
           plant.leaves >= 0 &&
           plant.fruits >= 0 &&
           plant.date !== '' &&
           plant.plotId !== undefined;
  }

  private resetCurrentPlant() {
    this.currentPlant = { height: 0, leaves: 0, fruits: 0, date: '', plotId: undefined };
  }

  removeFromSession(tempId: number) {
    this.sessionPlants = this.sessionPlants.filter(p => p.tempId !== tempId);
    this.sessionAverage = null; // Reset average when removing plant
  }

  clearSession() {
    this.sessionPlants = [];
    this.sessionAverage = null;
    this.resetCurrentPlant();
  }

  calculateSessionAverage() {
    if (this.sessionPlants.length === 0) return;

    const total = this.sessionPlants.reduce((acc, p) => {
      acc.height += p.height;
      acc.leaves += p.leaves;
      acc.fruits += p.fruits;
      acc.date += new Date(p.date).getTime();
      return acc;
    }, { height: 0, leaves: 0, fruits: 0, date: 0 });

    const avgDate = new Date(total.date / this.sessionPlants.length);

    this.sessionAverage = {
      height: total.height / this.sessionPlants.length,
      leaves: total.leaves / this.sessionPlants.length,
      fruits: total.fruits / this.sessionPlants.length,
      date: avgDate.toISOString().substring(0, 10),
      plantsCount: this.sessionPlants.length
    };
  }

  saveSession() {
    if (this.sessionAverage && this.sessionPlants.length > 0) {
      // Crear un registro promediado para enviar al componente padre
      const averagedPlant: Plant = {
        id: Date.now(),
        height: this.sessionAverage.height,
        leaves: Math.round(this.sessionAverage.leaves),
        fruits: Math.round(this.sessionAverage.fruits),
        date: this.sessionAverage.date,
        plotId: this.sessionPlants[0].plotId // Usar el plotId de las plantas de la sesión
      };

      this.plantAdded.emit(averagedPlant);
      this.clearSession();
    }
  }

  // Método obsoleto - ya no se usa
  addPlant() {
    // Este método ya no se usa con la nueva lógica de sesión
  }

  // Método obsoleto - ya no se usa
  calculateAverage() {
    // Este método ya no se usa con la nueva lógica de sesión
  }
}
