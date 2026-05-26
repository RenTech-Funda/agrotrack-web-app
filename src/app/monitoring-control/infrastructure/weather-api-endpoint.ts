import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Weather } from '../domain/model/weather.entity';
import { WeatherResource } from './weather-response';
import { WeatherAssembler } from './weather-assembler';

/**
 * API endpoint for fetching weather data from external weather service.
 */
@Injectable({
  providedIn: 'root'
})
export class WeatherApiEndpoint {
  private readonly baseUrl = environment.weatherApiBaseUrl;
  private readonly apiKey = environment.weatherApiKey;
  private readonly location = environment.weatherApiDefaultLocation;
  private readonly assembler = new WeatherAssembler();

  constructor(private http: HttpClient) {}

  /**
   * Retrieves current weather data for the configured location.
   * @param locationQuery - Optional location query (defaults to environment location).
   * @returns Observable emitting a Weather entity.
   */
  getCurrentWeather(locationQuery?: string): Observable<Weather> {
    const location = locationQuery || this.location;
    const endpoint = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${location}&aqi=yes`;

    return this.http.get<WeatherResource>(endpoint).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource))
    );
  }

  /**
   * Retrieves current weather data with full resource details.
   * @param locationQuery - Optional location query (defaults to environment location).
   * @returns Observable emitting the full WeatherResource.
   */
  getCurrentWeatherResource(locationQuery?: string): Observable<WeatherResource> {
    const location = locationQuery || this.location;
    const endpoint = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${location}&aqi=yes`;

    return this.http.get<WeatherResource>(endpoint);
  }
}

