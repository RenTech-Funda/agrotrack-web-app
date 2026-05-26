import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {PlantType, PlantTypes} from '../domain/model/plant-type.entity';
import {PlantTypeResource, PlantTypesResponse} from './planttypes-response';

export class PlanttypesAssembler implements BaseAssembler<PlantType,PlantTypeResource, PlantTypesResponse> {
  /**
   * Converts a PlantTypesResponse to an array of PlantType entities.
   * @param response - The API response containing plant types.
   * @return An array of PlantType entities.
   */
  toEntitiesFromResponse(response: PlantTypesResponse): PlantType[] {
    return response.plantTypes.map(resource =>
      this.toEntityFromResource(resource as PlantTypeResource));
  }

  /**
   * Converts a PlantTypeResource to a PlantType entity.
   * @param resource - The resource to convert.
   * @return The converted PlantType entity.
   */
  toEntityFromResource(resource: PlantTypeResource): PlantType {
    return new PlantType({
      id: resource.id,
      name: resource.name,
      type: resource.type as PlantTypes,
      isCustom: resource.isCustom
    });
  }

  /**
   * Converts a PlantType entity to a PlantTypeResource.
   * @param entity - The PlantType entity to convert.
   * @return The converted PlantTypeResource.
   */
  toResourceFromEntity(entity: PlantType): PlantTypeResource {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      isCustom: entity.isCustom
    } as PlantTypeResource
  }
}
