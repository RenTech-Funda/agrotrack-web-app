import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface SubscriptionResource extends BaseResource{
  /**
   * The unique identifier for the subscription.
   */
  id: number;
  /**
   * The plan of the subscription.
   */
  plan: string;
  /**
   * The start date of the subscription.
   */
  startDate: string;
  /**
   * The end date of the subscription.
   */
  endDate: string;
  /**
   * The status of the subscription.
   */
  status: string;
}

/**
 * Represents the API response structure for a list of subscriptions.
 */
export interface SubscriptionsResponse extends BaseResponse {
  /**
   * The list of subscriptions returned by the API.
   */
  subscriptions: SubscriptionResource[];
}
