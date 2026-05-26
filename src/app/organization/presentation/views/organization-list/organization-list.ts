import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.css']
})
export class OrganizationList implements OnInit {
  readonly store = inject(OrganizationStore);
  private readonly iamStore = inject(IamStore)
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    const profileId = this.iamStore.currentUserIdValue;
    if (profileId) {
      this.store.loadOrganizationsByOwner(profileId);
    } else {
      console.error('No profile ID found in session');
    }
  }

  navigateToOrganization(id: number): void {
    this.router.navigate(['/organization', id]).then();
  }

  navigateToNew(): void {
    this.router.navigate(['/organization/new']).then();
  }

  deleteOrganization(id: number): void {
    const confirmMessage = this.translate.instant('organization.delete-confirm');
    if (confirm(confirmMessage)) {
      this.store.deleteOrganization(id);
    }
  }

  editOrganization(id: number): void {
    this.router.navigate(['/organization', id, 'edit']).then();
  }

  navigateToMembers(id: number): void {
    this.router.navigate(['/organization', id, 'members']).then();
  }


}
