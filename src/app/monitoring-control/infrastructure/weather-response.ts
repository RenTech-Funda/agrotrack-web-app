/**
 * Resource representing the weather API response structure.
 * Only includes fields used by the Weather entity.
 */
export interface WeatherResource {
  location: any; // Not used in entity, but part of API response
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
  };
}

