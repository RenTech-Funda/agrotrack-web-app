import { Component, inject, Signal, computed } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-organization-members',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatSelectModule, MatOptionModule, NgOptimizedImage, DatePipe, TranslatePipe],
  templateUrl: './organization-members.html',
  styleUrls: ['./organization-members.css']
})
export class OrganizationMembers {
  private route = inject(ActivatedRoute);
  readonly store = inject(OrganizationStore);
  private router = inject(Router);

  readonly orgId = computed(() => Number(this.route.snapshot.params['id']));
  readonly members = this.store.getMembersOfOrganization(this.orgId());
  readonly available = this.store.getAvailableProfilesForOrganization(this.orgId());

  selectedProfileId: number | null = null;

  addMember() {
    if (this.selectedProfileId) {
      this.store.addMemberToOrganization(this.orgId(), this.selectedProfileId);
      this.selectedProfileId = null;
    }
  }

  removeMember(profileId: number) {
    this.store.removeMemberFromOrganization(this.orgId(), profileId);
  }

  goBack() {
    // Vuelve al listado principal
    this.router.navigate(['/organization']).then();
    // Si prefieres “volver” al historial:
    // window.history.length > 1 ? window.history.back() : this.router.navigate(['/organization']);
  }
}
