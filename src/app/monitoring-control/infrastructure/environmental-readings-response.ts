import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Represents the API resource/DTO for an Environmental Reading.
 */
export interface EnvironmentalReadingResource extends BaseResource {
  id: number;
  plotId: number;
  type: string;
  value: number;
  unit: string;
  measuredAt: string; // ISO date string from API
}

/**
 * Represents the API response structure for a list of environmental readings.
 */
export interface EnvironmentalReadingsResponse extends BaseResponse {
  readings: EnvironmentalReadingResource[];
}
