
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {PlantType} from '../domain/model/plant-type.entity';
import {PlantTypeResource, PlantTypesResponse} from './planttypes-response';
import {PlanttypesAssembler} from './planttypes-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

/**
 * API endpoint for plant types.
 */
export class PlanttypesApiEndpoint extends BaseApiEndpoint<PlantType, PlantTypeResource, PlantTypesResponse, PlanttypesAssembler>{
  /**
   * Creates an instance of PlanttypesApiEndpoint.
   * @param http - The HTTP client to use for API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlantTypesEndpointPath}`, new PlanttypesAssembler());
  }
}
