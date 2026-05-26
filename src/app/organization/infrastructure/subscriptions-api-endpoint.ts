import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Subscription} from '../domain/model/subscription.entity';
import {SubscriptionResource, SubscriptionsResponse} from './subscriptions-response';
import {SubscriptionAssembler} from './subscription-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

/**
 * API endpoint for managing subscriptions.
 */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<Subscription, SubscriptionResource, SubscriptionsResponse, SubscriptionAssembler>{
  /**
   * Creates an instance of SubscriptionsApiEndpoint.
   * @param http - The HTTP client to use for API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`, new SubscriptionAssembler());
  }
}
