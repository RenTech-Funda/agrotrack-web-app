import { PlantSamplingSession, SampleAverage } from '../domain/model/plant-samplimg-session.entity';
import { PlantObservation } from '../domain/model/plant-observation.entity';
import {
  PlantSamplingSessionResource,
  PlantObservationResource,
  SampleAverageResource
} from './plant-sampling-session-resource';

/**
 * Assembler for converting between PlantSamplingSession entities and API resources.
 */
export class PlantSamplingSessionAssembler {
  /**
   * Converts a PlantObservationResource to a PlantObservation entity.
   * @param resource - The observation resource to convert.
   */
  private toObservationEntityFromResource(resource: PlantObservationResource): PlantObservation {
    return new PlantObservation({
      id: resource.id,
      heightCm: resource.heightCm,
      leafCount: resource.leafCount,
      fruitCount: resource.fruitCount,
      notes: resource.notes
    });
  }

  /**
   * Converts a PlantObservation entity to a PlantObservationResource.
   * @param entity - The observation entity to convert.
   */
  private toObservationResourceFromEntity(entity: PlantObservation): PlantObservationResource {
    return {
      id: entity.id,
      heightCm: entity.heightCm,
      leafCount: entity.leafCount,
      fruitCount: entity.fruitCount,
      notes: entity.notes
    };
  }

  /**
   * Converts a SampleAverageResource to a SampleAverage entity.
   * @param resource - The average resource to convert.
   */
  private toAverageEntityFromResource(resource: SampleAverageResource): SampleAverage {
    return new SampleAverage({
      avgHeightCm: resource.avgHeightCm,
      avgLeafCount: resource.avgLeafCount,
      avgFruitCount: resource.avgFruitCount
    });
  }

  /**
   * Converts a SampleAverage entity to a SampleAverageResource.
   * @param entity - The average entity to convert.
   */
  private toAverageResourceFromEntity(entity: SampleAverage): SampleAverageResource {
    return {
      avgHeightCm: entity.avgHeightCm,
      avgLeafCount: entity.avgLeafCount,
      avgFruitCount: entity.avgFruitCount
    };
  }

  /**
   * Converts a PlantSamplingSessionResource to a PlantSamplingSession entity.
   * @param resource - The resource to convert.
   */
  toEntityFromResource(resource: PlantSamplingSessionResource): PlantSamplingSession {
    return new PlantSamplingSession({
      id: resource.id,
      plotId: resource.plotId,
      sampledAt: resource.sampledAt,
      average: this.toAverageEntityFromResource(resource.average),
      observations: resource.observations.map(obs => this.toObservationEntityFromResource(obs))
    });
  }

  /**
   * Converts a PlantSamplingSession entity to a PlantSamplingSessionResource.
   * @param entity - The entity to convert.
   */
  toResourceFromEntity(entity: PlantSamplingSession): PlantSamplingSessionResource {
    return {
      id: entity.id,
      plotId: entity.plotId,
      sampledAt: entity.sampledAt,
      average: this.toAverageResourceFromEntity(entity.average),
      observations: entity.observations.map(obs => this.toObservationResourceFromEntity(obs))
    };
  }
}

