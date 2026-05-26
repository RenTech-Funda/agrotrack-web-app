import { Component, inject, OnInit } from '@angular/core';
import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card'; // Agregue MatCardSubtitle
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatSelect, MatOption } from '@angular/material/select';
import { Router } from '@angular/router';
import { ReportStore } from '../../../application/report.store';
import { CreateReportCommand } from '../../../domain/model/create-report.command';
import { OrganizationStore } from '../../../../organization/application/organization.store';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon'; // <--- Importar Icono
import { TranslatePipe } from '@ngx-translate/core';   // <--- Importar Pipe
import { provideNativeDateAdapter } from '@angular/material/core';
import {CommonModule} from '@angular/common';
/**
 * Component for the create report form.
 * @author FloweyTech developer team
 */
@Component({
  selector: 'app-create-report-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent,
    MatFormField, MatInput, MatButton, MatError, MatLabel, MatSelect, MatOption,
    MatDatepickerModule, MatIconModule, TranslatePipe
  ],
  templateUrl: './create-report-form.html',
  styleUrls: ['./create-report-form.css']
})
export class CreateReportForm extends BaseForm implements OnInit {
  private reportStore = inject(ReportStore);
  public orgStore = inject(OrganizationStore);
  private router = inject(Router);

  reportTypes = ['PARCEL', 'GENERAL'];
  metricTypes = ['TEMPERATURE', 'HUMIDITY', 'PH_LEVEL'];

  form = new FormGroup({
    organizationId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    plotId: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    metricType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    periodStart: new FormControl<Date | null>(null, { validators: [Validators.required] }), // Cambiado a Date | null para el picker
    periodEnd: new FormControl<Date | null>(null, { validators: [Validators.required] })
  });

  ngOnInit() {
    const profileId = sessionStorage.getItem('profile_id');
    if (profileId) {
      this.orgStore.loadOrganizationsByOwner(parseInt(profileId, 10));
    }

    this.form.controls.organizationId.valueChanges.subscribe((orgId) => {
      if (orgId) {
        this.form.controls.plotId.enable();
        this.orgStore.loadPlotsByOrganization(orgId);
      } else {
        this.form.controls.plotId.disable();
        this.form.controls.plotId.reset();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/report']);
  }

  performCreate() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();

    // Lógica segura de fechas para el Backend
    // El datepicker entrega un objeto Date. Aquí lo transformamos a string YYYY-MM-DD
    const startString = formValue.periodStart ? new Date(formValue.periodStart).toISOString().split('T')[0] : '';
    const endString = formValue.periodEnd ? new Date(formValue.periodEnd).toISOString().split('T')[0] : '';

    const command = new CreateReportCommand({
      organizationId: Number(formValue.organizationId),
      plotId: Number(formValue.plotId),
      type: formValue.type!,
      metricType: formValue.metricType!,
      periodStart: startString,
      periodEnd: endString
    });

    this.reportStore.createReport(command, this.router);
  }
}
