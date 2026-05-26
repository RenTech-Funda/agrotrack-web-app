import {Component, inject, OnInit} from '@angular/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher implements OnInit {
  protected currentLang: string = 'en';

  /** List of available language codes */
  protected languages: string[] = ['en', 'es'];
  /** Translation service instance */
  private translate: TranslateService;

  /**
   * Creates an instance of LanguageSwitcherComponent.
   * Initializes the current language from the translation service.
   */
  constructor() {
    this.translate = inject(TranslateService);
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    this.currentLang = this.translate.currentLang || savedLang;

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      console.log('Idioma cambiado a:', event.lang);
    });
  }

  /**
   * Changes the application's current language.
   * Updates both the translation service and the component's local state.
   *
   * @param language - The language code to switch to (e.g., 'en', 'es')
   */
  useLanguage(language: string) {
    console.log('Cambiando idioma a:', language);
    this.translate.use(language);
    this.currentLang = language;
    localStorage.setItem('preferred-language', language);
  }
}
