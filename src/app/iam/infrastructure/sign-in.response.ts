import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * @summary Resource interface for sign-in operations in the infrastructure layer.
 * @description Represents the data payload returned by the API after a successful user authentication, including the access token and user role.
 * @author FloweyTech
 */
export interface SignInResource extends BaseResource {
  id: number;
  username: string;
  token: string;
  role: string;
}

/**
 * @summary Response interface for sign-in API calls.
 * @description Combines the standard base response structure with the specific sign-in resource data.
 * @author FloweyTech
 */
export interface SignInResponse extends BaseResponse, SignInResource {}
