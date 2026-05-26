import {BaseResource} from '../../shared/infrastructure/base-response';
import {PlantTypeResource} from './planttypes-response';


/**
 * Represents the API resource/DTO for a Plot.
 */
export interface PlotResource extends BaseResource {
  id: number;
  name: string;
  area: number;
  location: string;
  plantType: PlantTypeResource;
  organizationId: number;
}

/**
 * Represents the API response structure for a list of plots.
 */
export interface PlotsResponse extends BaseResource {
  /**
   * The list of plots returned by the API.
   */
  plots: PlotResource[];
}


