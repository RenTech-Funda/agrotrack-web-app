import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { EnvironmentalReading, ReadingType } from '../../../domain/model/environmental-reading.entity';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

/**
 * Form component for creating or simulating an IoT environmental reading.
 */
@Component({
  selector: 'app-reading-form',
  standalone: true,
  templateUrl: './reading-form.html',
  styleUrls: ['./reading-form.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
    MatIcon
  ]
})
export class ReadingForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly monitoringControlStore = inject(MonitoringStore);
  readonly organizationStore = inject(OrganizationStore);
  private readonly router = inject(Router);

  /** Loading state for form submission */
  isSubmitting = false;

  /** Reactive form definition */
  form = this.fb.group({
    organizationId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    plotId: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    type: new FormControl<ReadingType | null>(null, { validators: [Validators.required] }),
    value: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    unit: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  /** Enum values for reading types */
  readonly readingTypes = [
    { value: ReadingType.TEMPERATURE, label: 'Temperatura' },
    { value: ReadingType.HUMIDITY, label: 'Humedad' },
    { value: ReadingType.PH_LEVEL, label: 'Nivel pH' }
  ];

  /** Gets active organizations */
  get organizations() {
    return this.organizationStore.organizationsByOwner().filter(org => org.isActive);
  }

  /** Gets plots filtered by selected organization */
  get plots() {
    const orgId = this.form.get('organizationId')?.value;
    if (!orgId) return [];
    return this.organizationStore.plotsByOrganization().filter(plot => plot.organizationId === orgId);
  }

  /** Loads organizations on init */
  ngOnInit(): void {
    const profileIdStr = sessionStorage.getItem('profile_id');
    const profileId = profileIdStr ? parseInt(profileIdStr, 10) : null;
    if (profileId) {
      this.organizationStore.loadOrganizationsByOwner(profileId);
    }
  }

  /** When organization changes, reset plot selection and load plots */
  onOrganizationChange(organizationId: number): void {
    const plotControl = this.form.get('plotId');
    
    // Reset and enable/disable plot control
    plotControl?.setValue(null);
    
    if (organizationId) {
      plotControl?.enable();
      this.organizationStore.loadPlotsByOrganization(organizationId);
    } else {
      plotControl?.disable();
    }
  }

  /** Selects a reading type and updates the unit automatically */
  selectReadingType(type: ReadingType): void {
    this.form.patchValue({
      type,
      unit: this.getDefaultUnit(type)
    });
  }

  /** Gets the default unit for a reading type */
  getDefaultUnit(type: ReadingType): string {
    switch (type) {
      case ReadingType.TEMPERATURE:
        return '°C';
      case ReadingType.HUMIDITY:
        return '%';
      case ReadingType.PH_LEVEL:
        return 'pH';
      default:
        return '';
    }
  }

  /** Gets the icon for a reading type */
  getTypeIcon(type: ReadingType): string {
    switch (type) {
      case ReadingType.TEMPERATURE:
        return 'thermostat';
      case ReadingType.HUMIDITY:
        return 'water_drop';
      case ReadingType.PH_LEVEL:
        return 'science';
      default:
        return 'sensors';
    }
  }

  /** Gets the icon color for a reading type */
  getTypeIconColor(type: ReadingType): string {
    switch (type) {
      case ReadingType.TEMPERATURE:
        return '#ff4757';
      case ReadingType.HUMIDITY:
        return '#3742fa';
      case ReadingType.PH_LEVEL:
        return '#2f3542';
      default:
        return '#57606f';
    }
  }

  /** Gets the display name for a reading type */
  getTypeDisplayName(type: ReadingType): string {
    switch (type) {
      case ReadingType.TEMPERATURE:
        return 'Temperatura';
      case ReadingType.HUMIDITY:
        return 'Humedad';
      case ReadingType.PH_LEVEL:
        return 'Nivel pH';
      default:
        return type;
    }
  }

  /** Gets placeholder text for the value input */
  getValuePlaceholder(): string {
    const type = this.form.get('type')?.value;
    switch (type) {
      case ReadingType.TEMPERATURE:
        return 'Ej: 25.5';
      case ReadingType.HUMIDITY:
        return 'Ej: 65.2';
      case ReadingType.PH_LEVEL:
        return 'Ej: 6.8';
      default:
        return 'Ingresa el valor';
    }
  }

  /** Gets hint text for the value input */
  getValueHint(): string {
    const type = this.form.get('type')?.value;
    switch (type) {
      case ReadingType.TEMPERATURE:
        return 'Rango normal: 15-35°C';
      case ReadingType.HUMIDITY:
        return 'Rango normal: 40-80%';
      case ReadingType.PH_LEVEL:
        return 'Rango normal: 5.5-7.5 pH';
      default:
        return '';
    }
  }

  /** Gets available unit suggestions */
  getUnitSuggestions(): string[] {
    const type = this.form.get('type')?.value;
    switch (type) {
      case ReadingType.TEMPERATURE:
        return ['°C', '°F', 'K'];
      case ReadingType.HUMIDITY:
        return ['%', 'g/kg'];
      case ReadingType.PH_LEVEL:
        return ['pH'];
      default:
        return [];
    }
  }

  /** Selects a unit from suggestions */
  selectUnit(unit: string): void {
    this.form.patchValue({ unit });
  }

  /** Gets current date and time formatted */
  getCurrentDateTime(): string {
    return new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Submits the form, creating a new environmental reading.
   */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const reading = new EnvironmentalReading({
        id: 0, // Backend will assign ID
        plotId: this.form.value.plotId!,
        type: this.form.value.type!,
        value: this.form.value.value!,
        unit: this.form.value.unit!,
        measuredAt: new Date()
      });

      this.monitoringControlStore.addReading(reading);

      await this.router.navigate(['/monitoring']);
    } catch (error) {
      // Error handling done in store
    } finally {
      this.isSubmitting = false;
    }
  }

  /** Marks all form fields as touched to show validation errors */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /** Navigates back to the monitoring main view. */
  cancel(): void {
    this.router.navigate(['/monitoring']).then();
  }
}
