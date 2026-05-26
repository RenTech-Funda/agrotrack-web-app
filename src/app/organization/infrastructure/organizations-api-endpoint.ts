import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Organization} from '../domain/model/organization.entity';
import {OrganizationResource, OrganizationsResponse} from './organizations-response';
import {OrganizationAssembler} from './organization-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

/**
 * API endpoint for managing organizations.
 */
export class OrganizationsApiEndpoint extends BaseApiEndpoint<Organization, OrganizationResource, OrganizationsResponse, OrganizationAssembler>{
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderOrganizationsEndpointPath}`,new OrganizationAssembler());
  }

}
