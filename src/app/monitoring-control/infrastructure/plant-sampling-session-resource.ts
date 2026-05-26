/**
 * Represents the API resource/DTO for a Plant Observation.
 */
export interface PlantObservationResource {
  id: number;
  heightCm: number;
  leafCount: number;
  fruitCount: number;
  notes: string;
}

/**
 * Represents the API resource/DTO for Sample Average.
 */
export interface SampleAverageResource {
  avgHeightCm: number;
  avgLeafCount: number;
  avgFruitCount: number;
}

/**
 * Represents the API resource/DTO for a Plant Sampling Session.
 */
export interface PlantSamplingSessionResource {
  id: number;
  plotId: number;
  sampledAt: string;
  average: SampleAverageResource;
  observations: PlantObservationResource[];
}

/**
 * Type alias for an array of Plant Sampling Session resources.
 */
export type PlantSamplingSessionsResponse = PlantSamplingSessionResource[];

