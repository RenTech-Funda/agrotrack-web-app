import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationStore } from '../../../application/organization.store';
import {IamStore} from '../../../../iam/application/iam.store';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './subscription-payment.html',
  styleUrls: ['./subscription-payment.css']
})
export class SubscriptionPayment implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(OrganizationStore);
  private iamStore = inject(IamStore);

  organizationId!: number;
  subscriptionId!: number;
  organizationName: string = '';
  private formSubmitted = false;

  form = this.fb.group({
    cardNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^\d{16}$/)]
    }),
    cvv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.pattern(/^\d{3,4}$/)]
    }),
    expiryDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]
    })
  });

  constructor() {
    effect(() => {
      const loading = this.store.loading();
      const error = this.store.error();

      if (this.formSubmitted && !loading && !error) {
        console.log('Subscription activated successfully, redirecting...');
        this.router.navigate(['/organization', this.organizationId, 'plots']);
      } else if (this.formSubmitted && !loading && error) {
        console.error('Error activating subscription:', error);
        alert('Error activating subscription: ' + error);
        this.formSubmitted = false;
      }
    });

    // Effect to update subscription ID when organizations load
    effect(() => {
      const organizations = this.store.organizationsByOwner();
      if (organizations.length > 0 && this.organizationId && !this.subscriptionId) {
        const org = organizations.find(o => o.organizationId === this.organizationId);
        if (org) {
          this.subscriptionId = org.subscriptionId;
          this.organizationName = org.organizationName;
          console.log('Subscription ID updated from effect:', this.subscriptionId);
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.organizationId = +params['orgId'];

      // Get organization details from the list
      const profileId = this.iamStore.currentUserIdValue;
      if (profileId) {
        const organizations = this.store.organizationsByOwner();
        const org = organizations.find(o => o.organizationId === this.organizationId);

        if (org) {
          this.subscriptionId = org.subscriptionId;
          this.organizationName = org.organizationName;
          console.log('Subscription ID found:', this.subscriptionId);
        } else {
          console.error('Organization not found in list, reloading...');
          // If organization not found, reload the list
          this.store.loadOrganizationsByOwner(profileId);
        }
      }
    });
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    this.form.patchValue({ cardNumber: value });
  }

  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    this.form.patchValue({ cvv: value });
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.form.patchValue({ expiryDate: value });
  }

  submit(): void {
    if (!this.form.valid) {
      return;
    }

    if (!this.subscriptionId || this.subscriptionId === undefined) {
      console.error('Subscription ID is not available');
      alert('Error: Subscription ID not found. Please try again.');

      // Try to reload organization data
      const profileId = this.iamStore.currentUserIdValue;
      if (profileId) {
        this.store.loadOrganizationsByOwner(profileId);
      }
      return;
    }

    console.log('Activating subscription with ID:', this.subscriptionId);
    this.formSubmitted = true;
    this.store.activateSubscription(this.subscriptionId);
  }

  goBack(): void {
    this.router.navigate(['/organization']);
  }
}
