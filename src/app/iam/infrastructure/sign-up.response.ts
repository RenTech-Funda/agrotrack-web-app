import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * @summary Resource interface for sign-up operations in the infrastructure layer.
 * @description Represents the data payload returned by the API after a successful user registration, confirming the created account details.
 * @author FloweyTech
 */
export interface SignUpResource extends BaseResource {
  id: number;
  username: string;
  role: string;
}

/**
 * @summary Response interface for sign-up API calls.
 * @description Combines the standard base response structure with the specific sign-up resource data.
 * @author FloweyTech
 */
export interface SignUpResponse extends BaseResponse, SignUpResource {}
