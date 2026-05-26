import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface PlantTypeResource extends BaseResource {
  id: number;
  name: string;
  isCustom: boolean;
  type: string;
}

export interface PlantTypesResponse extends BaseResponse{
  plantTypes: PlantTypeResource[];
}
