import { Component, inject, signal, effect } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, Event as RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Layout } from './shared/presentation/components/layout/layout';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('agrotrack-web-app');

  private translate = inject(TranslateService);


  constructor() {

    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    this.translate.use(savedLang);

  }
}
