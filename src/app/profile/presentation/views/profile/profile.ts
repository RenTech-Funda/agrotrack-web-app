import {Component, computed, inject, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {ProfileStore} from '../../../application/profile.store';
import {IamStore} from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private readonly store = inject(IamStore);
  readonly name = this.store.currentUsername;


  readonly avatarUrl = computed(() => {
    return this.store.isSignedIn()
      ? 'https://i.pravatar.cc/100?u=agro'
      : null;
  });
}
