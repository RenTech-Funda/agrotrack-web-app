import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-plot-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    TranslatePipe,
    DecimalPipe,
    CommonModule
  ],
  templateUrl: './plot-list.html',
  styleUrls: ['./plot-list.css']
})
export class PlotList implements OnInit {
  readonly store = inject(OrganizationStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);

  organizationId!: number;
  readonly plotsByOrganization = this.store.plotsByOrganization;
  readonly profileMembers = this.store.profileMembers;
  readonly organizationsByOwner = this.store.organizationsByOwner;

  constructor() {
    this.route.params.subscribe(params => {
      this.organizationId = +params['orgId'];
    });
  }

  ngOnInit(): void {
    if (this.organizationId) {
      this.store.loadPlotsByOrganization(this.organizationId);
      
      // Load organization members
      const currentOrg = this.organizationsByOwner().find(org => org.organizationId === this.organizationId);
      if (currentOrg && currentOrg.profileIds) {
        this.store.loadProfileMembers(currentOrg.profileIds);
      }
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/organization', this.organizationId, 'plots', 'new']).then();
  }

  deletePlot(id: number): void {
    const confirmMessage = this.translate.instant('plot.deleteConfirm');
    if (confirm(confirmMessage)) {
      this.store.deletePlot(id);
    }
  }

  editPlot(id: number): void {
    this.router.navigate(['/organization', this.organizationId, 'plots', id, 'edit']).then();
  }

  goToPlantRegistrationList(plotId: number): void {
    this.router.navigate(['/monitoring/plant-registration']).then();
  }

  removeMember(profileId: number): void {
    const confirmMessage = this.translate.instant('organization.removeMemberConfirm');
    if (confirm(confirmMessage)) {
      this.store.removeProfileFromOrganization(this.organizationId, profileId);
    }
  }

  openAddMemberDialog(): void {
    const dialogRef = this.dialog.open(AddMemberDialog, {
      width: '600px',
      data: { organizationId: this.organizationId }
    });

    dialogRef.afterClosed().subscribe(() => {
      // No need to reload manually, the store handles it
    });
  }
}

// Add Member Dialog Component
@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person_add</mat-icon>
      {{ 'organization.addMember' | translate }}
    </h2>
    
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>{{ 'organization.searchMember' | translate }}</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [formControl]="searchControl" placeholder="{{ 'organization.searchMemberPlaceholder' | translate }}" />
        @if (searchControl.value) {
          <button matSuffix mat-icon-button (click)="clearSearch()">
            <mat-icon>clear</mat-icon>
          </button>
        }
      </mat-form-field>

      <div class="search-results">
        @if (profileSearchResults().length === 0 && searchControl.value && searchControl.value.length >= 2) {
          <p class="no-results">{{ 'organization.noProfilesFound' | translate }}</p>
        }

        @if (profileSearchResults().length === 0 && (!searchControl.value || searchControl.value.length < 2)) {
          <p class="search-hint">{{ 'organization.searchHint' | translate }}</p>
        }

        @for (profile of profileSearchResults(); track profile.profileId) {
          <mat-card class="profile-card" (click)="selectProfile(profile)">
            <mat-card-content>
              <div class="profile-item">
                <img 
                  [src]="profile.photoUrl || 'assets/images/default-avatar.png'" 
                  [alt]="profile.fullName"
                  class="profile-avatar"
                />
                <div class="profile-info">
                  <p class="profile-name">{{ profile.fullName }}</p>
                </div>
                <mat-icon class="add-icon">add_circle</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'actions.cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .search-results {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .profile-card {
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .profile-card:hover {
      background-color: #f5f5f5;
      transform: translateX(4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .profile-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e0e0e0;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .add-icon {
      color: #4caf50;
    }

    .no-results, .search-hint {
      text-align: center;
      color: #999;
      padding: 40px 20px;
      font-size: 14px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AddMemberDialog {
  private readonly store = inject(OrganizationStore);
  private readonly dialogRef = inject(MatDialog);
  private readonly data = inject<any>(MAT_DIALOG_DATA);
  
  organizationId: number;
  searchControl = new FormControl<string>('', { nonNullable: true });
  readonly profileSearchResults = this.store.profileSearchResults;

  constructor() {
    this.organizationId = this.data?.organizationId || 0;

    // Watch for search term changes
    this.searchControl.valueChanges.subscribe(term => {
      this.store.searchProfiles(term);
    });
  }

  selectProfile(profile: any): void {
    this.store.addProfileToOrganization(this.organizationId, profile.profileId);
    this.dialogRef.closeAll();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.store.clearProfileSearchResults();
  }

  cancel(): void {
    this.store.clearProfileSearchResults();
    this.dialogRef.closeAll();
  }
}
