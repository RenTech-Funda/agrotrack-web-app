import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Plot} from '../domain/model/plot.entity';
import {PlotResource, PlotsResponse} from './plots-response';
import {PlanttypesAssembler} from './planttypes-assembler';


/**
 * Assembles Plot entities from raw data objects.
 */
export class PlotAssembler implements BaseAssembler<Plot, PlotResource, PlotsResponse>{
  /**
   * Assembler for PlantType entities.
   */
  private readonly plantTypeAssembler = new PlanttypesAssembler();

  /**
   * Converts a PlotsResponse to an array of Plot entities.
   * @param response - The API response containing plots.
   * @return An array of Plot entities.
   */
  toEntitiesFromResponse(response: PlotsResponse): Plot[] {
    return response.plots.map(resource =>
    this.toEntityFromResource(resource as PlotResource));
  }

  /**
   * Converts a PlotResource to a Plot entity.
   * @param resource - The resource to convert.
   * @return The converted Plot entity.
   */
  toEntityFromResource(resource: PlotResource): Plot {
    return new Plot({
      id: resource.id,
      name: resource.name,
      area: resource.area,
      location: resource.location,
      plantType: this.plantTypeAssembler.toEntityFromResource(resource.plantType),
      organizationId: resource.organizationId
    });
  }

  /**
   * Converts a Plot entity to a PlotResource.
   * @param entity - The Plot entity to convert.
   * @return The converted PlotResource.
   */
  toResourceFromEntity(entity: Plot): PlotResource {
    return {
      id: entity.id,
      name: entity.name,
      area: entity.area,
      location: entity.location,
      plantType: this.plantTypeAssembler.toResourceFromEntity(entity.plantType),
      organizationId: entity.organizationId
    } as PlotResource;
  }
}
