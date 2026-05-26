import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Organization, OrganizationStatus} from '../domain/model/organization.entity';
import {OrganizationResource, OrganizationsResponse} from './organizations-response';
import {resource} from '@angular/core';
import {SubscriptionAssembler} from './subscription-assembler';

/**
 * Assembler for converting between Organization entities, OrganizationResource, resources and OrganizationResponse
 */
export class OrganizationAssembler implements BaseAssembler<Organization, OrganizationResource, OrganizationsResponse>{
  /**
   * Assembler for Subscription entities.
   */
  private readonly subscriptionAssembler = new SubscriptionAssembler();


  /**
   * Converts a OrganizationResponse to an array of Organization entities.
   * @param response - The API response containing organization.
   * @return An array of Organization entities.
   */
  toEntitiesFromResponse(response: OrganizationsResponse): Organization[] {
    return response.organizations.map(resource =>
    this.toEntityFromResource(resource as OrganizationResource));
  }

  /**
   * Converts a OrganizationResource to an Organization entity.
   * @param resource - The resource to convert.
   * @return The converted Organization entity.
   */
  toEntityFromResource(r: OrganizationResource): Organization {
    return new Organization({
      id: r.id,
      name: r.name,
      ownerProfileId: r.ownerProfileId,  // 👈
      members: r.members,
      status: r.status as OrganizationStatus,
      subscription: this.subscriptionAssembler.toEntityFromResource(r.subscription)
    });
  }

  /**
   * Converts an Organization entity to a OrganizationResource.
   * @param entity - The Organization entity to convert.
   * @return The converted OrganizationResource.
   */
  toResourceFromEntity(e: Organization): OrganizationResource {
    return {
      id: e.id,
      name: e.name,
      ownerProfileId: e.ownerProfileId,
      members: e.members,
      status: e.status,
      subscription: this.subscriptionAssembler.toResourceFromEntity(e.subscription)
    };
  }
}
