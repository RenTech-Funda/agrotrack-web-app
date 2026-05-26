import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { EnvironmentalReading, ReadingType } from '../domain/model/environmental-reading.entity';
import { EnvironmentalReadingResource, EnvironmentalReadingsResponse } from './environmental-readings-response';

/**
 * Assembler for converting between EnvironmentalReading entities and API resources/responses.
 */
export class EnvironmentalReadingAssembler
  implements BaseAssembler<EnvironmentalReading, EnvironmentalReadingResource, EnvironmentalReadingsResponse>
{
  /**
   * Converts an EnvironmentalReadingsResponse to an array of EnvironmentalReading entities.
   * @param response - The API response containing readings.
   */
  toEntitiesFromResponse(response: EnvironmentalReadingsResponse): EnvironmentalReading[] {
    return response.readings.map((resource) => this.toEntityFromResource(resource));
  }

  /**
   * Converts a single EnvironmentalReadingResource to an EnvironmentalReading entity.
   * @param resource - The resource to convert.
   */
  toEntityFromResource(resource: EnvironmentalReadingResource): EnvironmentalReading {
    return new EnvironmentalReading({
      id: resource.id,
      plotId: resource.plotId,
      type: resource.type as ReadingType,
      value: resource.value,
      unit: resource.unit,
      measuredAt: new Date(resource.measuredAt),
    });
  }

  /**
   * Converts an EnvironmentalReading entity to an EnvironmentalReadingResource.
   * @param entity - The EnvironmentalReading entity to convert.
   */
  toResourceFromEntity(entity: EnvironmentalReading): EnvironmentalReadingResource {
    return {
      id: entity.id,
      plotId: entity.plotId,
      type: entity.type,
      value: entity.value,
      unit: entity.unit,
      measuredAt: entity.measuredAt.toISOString(),
    };
  }
}
