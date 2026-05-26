/**
 * Weather entity that extracts temperature (°C) and condition from API response.
 */
export class Weather {
  temperature: number;
  condition: string;

  constructor({ location, current }: { location: any; current: { temp_c: number; condition: { text: string } } }) {
    this.temperature = current.temp_c;
    this.condition = current.condition.text;
  }
}
