import { Component, inject, effect } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { Organization, OrganizationStatus } from '../../../domain/model/organization.entity';
import { Subscription, SubscriptionStatus } from '../../../domain/model/subscription.entity';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { IamStore } from '../../../../iam/application/iam.store';

enum SubscriptionPlan {
  AGRO_START = 'AGRO_START',
  AGRO_SMART = 'AGRO_SMART',
  AGRO_EXPERT = 'AGRO_EXPERT'
}

interface PlanOption {
  value: SubscriptionPlan;
  name: string;
  benefits: string[];
  icon: string;
}

@Component({
  selector: 'app-organization-form',
  standalone: true,
  templateUrl: './organization-form.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    TranslatePipe,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatCardModule,
    MatRadioModule,
    MatIconModule
  ],
  styleUrls: ['./organization-form.css']
})
export class OrganizationForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(OrganizationStore); // CORRECTO
  private iamStore = inject(IamStore);



  step: 'plan' | 'duration' | 'name' = 'plan';
  selectedPlan: SubscriptionPlan | null = null;
  selectedDuration: number | null = null;
  private formSubmitted = false;

  plans: PlanOption[] = [
    {
      value: SubscriptionPlan.AGRO_START,
      name: 'organization.plans.AGRO_START.name',
      benefits: [
        'organization.plans.AGRO_START.benefits.plots',
        'organization.plans.AGRO_START.benefits.monitoring',
        'organization.plans.AGRO_START.benefits.support'
      ],
      icon: 'agriculture'
    },
    {
      value: SubscriptionPlan.AGRO_SMART,
      name: 'organization.plans.AGRO_SMART.name',
      benefits: [
        'organization.plans.AGRO_SMART.benefits.plots',
        'organization.plans.AGRO_SMART.benefits.monitoring',
        'organization.plans.AGRO_SMART.benefits.support',
        'organization.plans.AGRO_SMART.benefits.analytics'
      ],
      icon: 'speed'
    },
    {
      value: SubscriptionPlan.AGRO_EXPERT,
      name: 'organization.plans.AGRO_EXPERT.name',
      benefits: [
        'organization.plans.AGRO_EXPERT.benefits.plots',
        'organization.plans.AGRO_EXPERT.benefits.monitoring',
        'organization.plans.AGRO_EXPERT.benefits.support',
        'organization.plans.AGRO_EXPERT.benefits.analytics',
        'organization.plans.AGRO_EXPERT.benefits.reports'
      ],
      icon: 'workspace_premium'
    }
  ];

  durations = [
    { months: 1, label: 'organization.durations.1' },
    { months: 3, label: 'organization.durations.3' },
    { months: 12, label: 'organization.durations.12' }
  ];

  form = this.fb.group({
    organizationName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    effect(() => {
      const loading = this.store.loading();
      const error = this.store.error();

      if (this.formSubmitted && !loading && !error) {
        console.log('Organization created successfully, redirecting...');
        this.router.navigate(['/organization']);
      } else if (this.formSubmitted && !loading && error) {
        console.error('Error creating organization:', error);
        alert('Error creating organization: ' + error);
        this.formSubmitted = false;
      }
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
    this.step = 'duration';
  }

  selectDuration(months: number): void {
    this.selectedDuration = months;
    this.step = 'name';
  }

  goBack(): void {
    if (this.step === 'duration') {
      this.step = 'plan';
      this.selectedPlan = null;
    } else if (this.step === 'name') {
      this.step = 'duration';
      this.selectedDuration = null;
    } else {
      this.router.navigate(['/organization']).then();
    }
  }

  submit(): void {
    if (!this.form.valid || !this.selectedPlan || !this.selectedDuration) {
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + this.selectedDuration);

    this.formSubmitted = true;
    this.store.createOrganizationWithSubscription({
      subscriptionPlan: this.selectedPlan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizationName: this.form.value.organizationName!
    });
  }
}
