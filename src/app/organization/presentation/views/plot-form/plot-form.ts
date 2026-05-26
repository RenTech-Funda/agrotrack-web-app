import {Component, inject, effect, OnInit} from '@angular/core';
import {OrganizationStore} from '../../../application/organization.store';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Plot} from '../../../domain/model/plot.entity';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-plot-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    CommonModule,
    TranslatePipe
  ],
  templateUrl: './plot-form.html',
  styleUrl: './plot-form.css'
})
export class PlotForm implements OnInit {
  readonly store = inject(OrganizationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  // Step management
  currentStep: 'selectPlantType' | 'fillDetails' = 'selectPlantType';
  selectedPlantTypeId: number | null = null;
  selectedPlantTypeName: string = '';

  // Search control for plant types
  searchControl = new FormControl<string>('', { nonNullable: true });

  plotForm = this.fb.group({
    plotName: new FormControl<string>('',{nonNullable: true, validators: [Validators.required]}),
    size: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.1)] }),
    unit: new FormControl<string>('hectárea', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl<string>('', { nonNullable: true })
  });

  organizationId!: number;
  plotId?: number;
  isEdit = false;
  currentPlot?: Plot;
  readonly plantTypesList = this.store.plantTypesList;

  constructor() {
    this.route.params.subscribe((params: any) => {
      this.organizationId = +params['orgId'] || 0;
      this.plotId = params['id'] ? +params['id'] : undefined;
      this.isEdit = !!this.plotId;

      console.log('Route params:', { orgId: this.organizationId, plotId: this.plotId, isEdit: this.isEdit });
    });

    // Watch for search term changes
    this.searchControl.valueChanges.subscribe(term => {
      if (term && term.length >= 2) {
        this.store.searchPlantTypesByName(term);
      } else if (!term) {
        this.store.loadAllPlantTypes();
      }
    });
  }

  ngOnInit(): void {
    this.store.loadAllPlantTypes();

    if (this.isEdit) {
      // Skip plant type selection in edit mode
      this.currentStep = 'fillDetails';
    }

    effect(() => {
      if (this.isEdit && this.plotId && this.organizationId) {
        console.log('Effect ejecutándose para edición');
        const plots = this.store.getPlotsByOrganizationId(this.organizationId)();
        console.log('Plots disponibles:', plots);
        this.currentPlot = plots.find(p => p.id === this.plotId);
        console.log('Plot encontrado para editar:', this.currentPlot);

        if (this.currentPlot) {
          console.log('Cargando datos en formulario');
          this.selectedPlantTypeId = this.currentPlot.plantType.id;
          this.plotForm.patchValue({
            plotName: this.currentPlot.name,
            size: this.currentPlot.area,
            location: this.currentPlot.location
          });
        }
      }
    });
  }

  selectPlantType(plantType: any): void {
    this.selectedPlantTypeId = plantType.plantTypeId;
    this.selectedPlantTypeName = `${plantType.plantType} - ${plantType.name}`;
    this.currentStep = 'fillDetails';
    console.log('Plant type selected:', this.selectedPlantTypeId, this.selectedPlantTypeName);
  }

  goBackToPlantTypeSelection(): void {
    this.currentStep = 'selectPlantType';
    this.selectedPlantTypeId = null;
    this.selectedPlantTypeName = '';
  }

  submit(): void {
    if (!this.plotForm.valid || !this.selectedPlantTypeId) return;

    const formValue = this.plotForm.value;
    console.log('Submit ejecutándose:', { isEdit: this.isEdit, formValue, plantTypeId: this.selectedPlantTypeId });

    if (this.isEdit && this.currentPlot) {
      console.log('Actualizando parcela existente');
      const updatedPlot = new Plot({
        id: this.currentPlot.id,
        name: formValue.plotName!,
        area: formValue.size!,
        location: formValue.location ?? '',
        plantType: this.selectedPlantTypeId as any,
        organizationId: this.organizationId
      });
      this.store.updatePlot(updatedPlot);
    } else {
      console.log('Creando nueva parcela');
      const request = {
        plotName: formValue.plotName!,
        size: formValue.size!,
        unit: formValue.unit!,
        plantTypeId: this.selectedPlantTypeId!,
        location: formValue.location ?? '',
        organizationId: this.organizationId
      };
      this.store.createPlot(request, this.organizationId);
    }

    this.router.navigate(['/organization', this.organizationId, 'plots']).then();
  }

  goBack(): void {
    this.router.navigate(['/organization', this.organizationId, 'plots']).then();
  }

}
