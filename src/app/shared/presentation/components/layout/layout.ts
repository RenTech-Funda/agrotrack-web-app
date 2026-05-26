import {Component, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatNavList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {NgOptimizedImage} from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import {Profile} from '../../../../profile/presentation/views/profile/profile';
// 1. IMPORTAMOS LOS STORES
import { IamStore } from '../../../../iam/application/iam.store';
import { ProfileStore } from '../../../../profile/application/profile.store';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    // Angular
    RouterOutlet, RouterLink, RouterLinkActive,
    // i18n
    TranslatePipe, LanguageSwitcher,
    // Angular Material (standalone)
    MatSidenavContainer, MatSidenav, MatSidenavContent, MatIcon, MatIconButton,
    MatNavList, MatListItem, MatListItemIcon, MatListItemTitle, MatTooltip, MatToolbar, MatToolbarRow, NgOptimizedImage, Profile
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout implements OnInit, OnDestroy{
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  isMenuOpen = true;
  isMobile = false;

  private destroy$ = new Subject<void>();

  options = [
    { labelKey: 'nav.organization', icon: 'business',             route: '/organization' },
    { labelKey: 'nav.reports',      icon: 'assessment',           route: '/report' },
    { labelKey: 'nav.tasks',        icon: 'assignment_turned_in', route: '/tasks' },
    { labelKey: 'nav.monitoring',   icon: 'visibility',           route: '/monitoring' },
    { labelKey: 'nav.sampling_sessions', icon: 'science',            route: '/sampling-sessions' },
    { labelKey: 'nav.weather',      icon: 'cloud_queue',          route: '/monitoring/weather' },
    { labelKey: 'nav.settings',     icon: 'settings',             route: '/settings' }
  ];

  private router = inject(Router);
  // 2. INYECTAMOS LOS STORES
  private iamStore = inject(IamStore);
  private profileStore = inject(ProfileStore);

  constructor(private bp: BreakpointObserver) {}

  ngOnInit() {
    // Lógica Responsive
    this.bp.observe(['(max-width: 800px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isMobile = state.matches;
        if (this.isMobile) this.isMenuOpen = false;
      });

    // 3. MAGIA DE HIDRATACIÓN (Aquí se carga tu perfil al entrar)
    const userId = this.iamStore.currentUserIdValue;

    if (userId) {
      // Como ya estamos dentro de la zona segura (Layout),
      // pedimos cargar los datos del usuario para que salgan en la foto del header y settings.
      console.log('Layout: Cargando perfil del usuario...', userId);
      this.profileStore.loadProfilesByIds([userId]);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isCollapsed = true;

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle().catch(() => {});
      this.isCollapsed = false;
    } else {
      this.sidenav.open().catch(() => {});
      this.isCollapsed = !this.isCollapsed;
    }
  }

  logout() {
    // 4. LOGOUT CENTRALIZADO
    // Limpiamos los stores y salimos usando la lógica del IamStore
    this.profileStore.clearProfiles();
    this.iamStore.signOut(this.router);
  }
}
