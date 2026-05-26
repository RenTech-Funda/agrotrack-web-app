import { Weather } from '../domain/model/weather.entity';
import { WeatherResource } from './weather-response';

/**
 * Assembler for transforming between Weather entities and API resources.
 */
export class WeatherAssembler {
  /**
   * Converts a WeatherResource from the API to a Weather domain entity.
   * @param resource - The weather resource from the API response.
   * @returns A Weather entity with extracted temperature and condition.
   */
  toEntityFromResource(resource: WeatherResource): Weather {
    return new Weather({
      location: resource.location,
      current: resource.current
    });
  }

  /**
   * Converts a Weather entity to a resource (not typically used for weather API).
   * @param entity - The Weather domain entity.
   * @returns A partial WeatherResource (weather API is read-only).
   */
  toResourceFromEntity(entity: Weather): Partial<WeatherResource> {
    // Weather API is typically read-only, this method is for consistency
    return {
      current: {
        temp_c: entity.temperature,
        condition: {
          text: entity.condition,
          icon: '',
          code: 0
        }
      } as any
    };
  }
}

