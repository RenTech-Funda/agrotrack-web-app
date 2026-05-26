import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {SubscriptionResource} from './subscriptions-response';

/**
 * Represents the API resource/DTO for a Category.
 */
export interface OrganizationResource extends BaseResource{
  /**
   * The unique identifier for the organization.
   */
  id: number;
  /**
   * The name of the organization.
   */
  name: string;
  /**
   * The members of the organization.
   */
  members: Array<number>;
  /**
   * status of the organization.
   */
  status: string;
  /**
   * The maximum number of plots allowed for the organization.
   */
  subscription : SubscriptionResource;

  ownerProfileId: number;

}


/**
 * Represents the API response structure for a list of organizations.
 */
export interface OrganizationsResponse extends BaseResponse{
  /**
   * The list of organizations returned by de API.
   */
  organizations: OrganizationResource[];

}
