import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Subscription, SubscriptionPlan, SubscriptionStatus} from '../domain/model/subscription.entity';
import {SubscriptionResource, SubscriptionsResponse} from './subscriptions-response';
import {resource} from '@angular/core';

export class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {
  /**
   * Converts a SubscriptionsResponse to an array of Subscription entities.
   * @param response - The API response containing subscriptions.
   * @return An array of Subscription entities.
   */
  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[]{
    return response.subscriptions.map(resource =>
    this.toEntityFromResource(resource as SubscriptionResource));
  }

  /**
   *Convert s a SubscriptionResource to a Subscription entity.
   * @param resource - The resource to convert.
   * @return The converted Subscription entity.
   */
  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription({
      id: resource.id,
      plan: resource.plan as SubscriptionPlan,
      startDate: new Date(resource.startDate),
      endDate: new Date(resource.endDate),
      status: resource.status as SubscriptionStatus
    });
  }

  /**
   * Converts a Subscription entity to a SubscriptionResource.
   * @param entity - The Subscription entity to convert.
   * @return The converted SubscriptionResource.
   */
  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {
      id: entity.id,
      plan: entity.plan,
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate.toISOString(),
      status: entity.status
    } as SubscriptionResource
  }
}
