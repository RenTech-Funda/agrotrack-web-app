import { Component, inject, OnInit, signal } from '@angular/core';
import { MonitoringStore } from '../../../application/monitoring-control.store';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

/**
 * Component for displaying current weather status and agricultural recommendations.
 */
@Component({
  selector: 'app-weather-status',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './weather-status.html',
  styleUrl: './weather-status.css'
})
export class WeatherStatus implements OnInit {
  readonly monitoringStore = inject(MonitoringStore);

  // Señal para manejar la ubicación personalizada
  customLocation = signal<string>('');
  currentLocation = signal<string>('');
  showLocationForm = signal<boolean>(false);

  ngOnInit(): void {
    // Cargar datos del clima al iniciar con ubicación por defecto
    this.loadWeather();
  }

  /** Carga los datos del clima */
  private loadWeather(location?: string): void {
    if (location) {
      this.currentLocation.set(location);
      this.monitoringStore.loadCurrentWeather(location);
    } else {
      this.monitoringStore.loadCurrentWeather();
    }
  }

  /** Recarga los datos del clima */
  refreshWeather(): void {
    const location = this.currentLocation();
    this.loadWeather(location || undefined);
  }

  /** Alterna la visibilidad del formulario de ubicación */
  toggleLocationForm(): void {
    this.showLocationForm.update(value => !value);
  }

  /** Actualiza la ubicación del clima */
  updateLocation(): void {
    const location = this.customLocation().trim();
    if (location) {
      this.loadWeather(location);
      this.showLocationForm.set(false);
      this.customLocation.set('');
    }
  }

  /** Cancela el cambio de ubicación */
  cancelLocationChange(): void {
    this.showLocationForm.set(false);
    this.customLocation.set('');
  }

  /** Obtiene el icono según la condición del clima */
  getWeatherIcon(condition: string): string {
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return 'wb_sunny';
    if (lowerCondition.includes('cloudy') || lowerCondition.includes('overcast')) return 'cloud';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return 'rainy';
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return 'thunderstorm';
    if (lowerCondition.includes('snow')) return 'ac_unit';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return 'foggy';
    if (lowerCondition.includes('wind')) return 'air';

    return 'wb_cloudy';
  }

  /** Obtiene la clase CSS según la temperatura */
  getTemperatureClass(temperature: number): string {
    if (temperature < 10) return 'temp-cold';
    if (temperature < 20) return 'temp-cool';
    if (temperature < 30) return 'temp-warm';
    return 'temp-hot';
  }

  /** Determina si la temperatura es óptima para cultivos (15-30°C) */
  isOptimalTemperature(temperature: number): boolean {
    return temperature >= 15 && temperature <= 30;
  }

  /** Obtiene el tipo de alerta según la temperatura */
  getTemperatureAlertType(temperature: number): 'info' | 'warning' | 'danger' | null {
    if (temperature < 5 || temperature > 40) return 'danger';
    if (temperature < 10 || temperature > 35) return 'warning';
    if (temperature >= 15 && temperature <= 30) return 'info';
    return null;
  }

  /** Obtiene recomendaciones basadas en el clima actual */
  getRecommendations(temperature: number, condition: string): string[] {
    const recommendations: string[] = [];
    const lowerCondition = condition.toLowerCase();

    // Recomendaciones por temperatura
    if (temperature < 10) {
      recommendations.push('weather.recommendations.protect_frost');
      recommendations.push('weather.recommendations.avoid_watering_morning');
    } else if (temperature > 35) {
      recommendations.push('weather.recommendations.increase_irrigation');
      recommendations.push('weather.recommendations.provide_shade');
    } else if (temperature >= 15 && temperature <= 30) {
      recommendations.push('weather.recommendations.optimal_growth');
    }

    // Recomendaciones por condición climática
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      recommendations.push('weather.recommendations.suspend_irrigation');
      recommendations.push('weather.recommendations.check_drainage');
    } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      recommendations.push('weather.recommendations.monitor_soil_moisture');
      if (temperature > 25) {
        recommendations.push('weather.recommendations.water_evening');
      }
    } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
      recommendations.push('weather.recommendations.postpone_activities');
      recommendations.push('weather.recommendations.secure_structures');
    } else if (lowerCondition.includes('wind')) {
      recommendations.push('weather.recommendations.check_supports');
    }

    return recommendations;
  }

  /** Obtiene alertas basadas en el clima actual */
  getAlerts(temperature: number, condition: string): string[] {
    const alerts: string[] = [];
    const lowerCondition = condition.toLowerCase();

    // Alertas por temperatura extrema
    if (temperature < 5) {
      alerts.push('weather.alerts.frost_risk');
    } else if (temperature > 40) {
      alerts.push('weather.alerts.heat_stress');
    } else if (temperature < 10) {
      alerts.push('weather.alerts.cold_warning');
    } else if (temperature > 35) {
      alerts.push('weather.alerts.high_heat');
    }

    // Alertas por condiciones climáticas adversas
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
      alerts.push('weather.alerts.storm_warning');
    } else if (lowerCondition.includes('heavy rain')) {
      alerts.push('weather.alerts.flooding_risk');
    } else if (lowerCondition.includes('wind')) {
      alerts.push('weather.alerts.strong_winds');
    }

    return alerts;
  }

  /** Obtiene la fecha y hora actual */
  getCurrentDateTime(): Date {
    return new Date();
  }
}
