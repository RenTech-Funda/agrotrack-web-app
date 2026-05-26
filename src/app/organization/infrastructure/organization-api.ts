import {Injectable} from '@angular/core';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {OrganizationsApiEndpoint} from './organizations-api-endpoint';
import {SubscriptionsApiEndpoint} from './subscriptions-api-endpoint';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {Organization} from '../domain/model/organization.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PlotsApiEndpoint} from './plots-api-endpoint';
import {PlantType, PlantTypes} from '../domain/model/plant-type.entity';
import {PlanttypesApiEndpoint} from './planttypes-api-endpoint';
import {Plot} from '../domain/model/plot.entity';
import {ProfilesApiEndpoint} from '../../profile/infrastructure/profiles-api-endpoint';
import {OrganizationByOwnerResponse} from './organization-by-owner-response';
import {CreateSubscriptionRequest, CreateSubscriptionResponse} from './create-subscription-request';
import {PlotByOrganizationResponse} from './plot-by-organization-response';
import {PlantTypeResponse} from './planttype-response';
import {CreatePlotRequest} from './create-plot-request';
import {ProfileDetailsResponse} from './profile-details-response';
import {AddProfileToOrganizationRequest} from './add-profile-request';
import {environment} from '../../../environments/environment';

/**
 * API service for managing endpoints in the learning context (organizations, subscriptions plots and plantTypes).
 */
@Injectable({providedIn: 'root'})
export class OrganizationApi extends BaseApi{
  private readonly organizationsEndpoint: OrganizationsApiEndpoint;
  private readonly subscriptionsEndpoint: SubscriptionsApiEndpoint;
  private readonly plotsEndpoint: PlotsApiEndpoint;
  private readonly plantTypesEndpoint: PlanttypesApiEndpoint;
  private readonly profilesEndpoint: ProfilesApiEndpoint;

  constructor(private http: HttpClient) {
    super();
    this.organizationsEndpoint = new OrganizationsApiEndpoint(http);
    this.subscriptionsEndpoint = new SubscriptionsApiEndpoint(http);
    this.plotsEndpoint = new PlotsApiEndpoint(http);
    this.plantTypesEndpoint = new PlanttypesApiEndpoint(http);
    this.profilesEndpoint = new ProfilesApiEndpoint(http);
  }

  /**
   * Retrieves organizations by owner profile ID.
   * @param ownerProfileId - The profile ID of the owner.
   * @returns An Observable for an array of simplified organization data.
   */
  getOrganizationsByOwner(ownerProfileId: number): Observable<OrganizationByOwnerResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/organizations/by-owner/${ownerProfileId}`;
    return this.http.get<OrganizationByOwnerResponse[]>(url);
  }

  /**
   * Retrieves organizations by profile ID (where the profile is a member).
   * @param profileId - The profile ID.
   * @returns An Observable for an array of organization data.
   */
  getOrganizationsByProfile(profileId: number): Observable<OrganizationByOwnerResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/organizations/by-profile/${profileId}`;
    return this.http.get<OrganizationByOwnerResponse[]>(url);
  }

  /**
   * Creates a new organization with subscription.
   * @param request - The subscription and organization data.
   * @returns An Observable of the created organization response.
   */
  createOrganizationWithSubscription(request: CreateSubscriptionRequest): Observable<CreateSubscriptionResponse> {
    const url = `${environment.platformProviderApiBaseUrl}/subscriptions`;
    return this.http.post<CreateSubscriptionResponse>(url, request);
  }

  /**
   * Activates a subscription by ID.
   * @param subscriptionId - The ID of the subscription to activate.
   * @returns An Observable of void.
   */
  activateSubscription(subscriptionId: number): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/subscriptions/${subscriptionId}/activate`;
    return this.http.put<void>(url, {});
  }

  /**
   * Retrieves plots by organization ID.
   * @param organizationId - The ID of the organization.
   * @returns An Observable of an array of PlotByOrganizationResponse objects.
   */
  getPlotsByOrganization(organizationId: number): Observable<PlotByOrganizationResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/plots/organization/${organizationId}`;
    return this.http.get<PlotByOrganizationResponse[]>(url);
  }

  /**
   * Retrieves plant type by ID.
   * @param plantTypeId - The ID of the plant type.
   * @returns An Observable of PlantTypeResponse object.
   */
  getPlantTypeById(plantTypeId: number): Observable<PlantTypeResponse> {
    const url = `${environment.platformProviderApiBaseUrl}/plant-types/${plantTypeId}`;
    return this.http.get<PlantTypeResponse>(url);
  }

  /**
   * Creates a new plot.
   * @param request - The plot creation request.
   * @returns An Observable of void.
   */
  createPlot(request: CreatePlotRequest): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/plots`;
    return this.http.post<void>(url, request);
  }

  /**
   * Retrieves profile details by profile ID.
   * @param profileId - The ID of the profile.
   * @returns An Observable of ProfileDetailsResponse object.
   */
  getProfileById(profileId: number): Observable<ProfileDetailsResponse> {
    const url = `${environment.platformProviderApiBaseUrl}/profiles/${profileId}`;
    return this.http.get<ProfileDetailsResponse>(url);
  }

  /**
   * Searches profiles by name.
   * @param searchTerm - The search term.
   * @returns An Observable of an array of ProfileDetailsResponse objects.
   */
  searchProfiles(searchTerm: string): Observable<ProfileDetailsResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/profiles/search?name=${encodeURIComponent(searchTerm)}`;
    return this.http.get<ProfileDetailsResponse[]>(url);
  }

  /**
   * Adds a profile to an organization.
   * @param organizationId - The ID of the organization.
   * @param request - The request with profileId.
   * @returns An Observable of void.
   */
  addProfileToOrganization(organizationId: number, request: AddProfileToOrganizationRequest): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/organizations/${organizationId}/profiles/add`;
    return this.http.put<void>(url, request);
  }

  /**
   * Removes a profile from an organization.
   * @param organizationId - The ID of the organization.
   * @param request - The request with profileId.
   * @returns An Observable of void.
   */
  removeProfileFromOrganization(organizationId: number, request: AddProfileToOrganizationRequest): Observable<void> {
    const url = `${environment.platformProviderApiBaseUrl}/organizations/${organizationId}/profiles/remove`;
    return this.http.put<void>(url, request);
  }

  /**
   * Retrieves all plant types.
   * @returns An Observable of an array of PlantTypeResponse objects.
   */
  getAllPlantTypes(): Observable<PlantTypeResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/plant-types`;
    return this.http.get<PlantTypeResponse[]>(url);
  }

  /**
   * Retrieves plant types by name.
   * @param name - The name to search for.
   * @returns An Observable of an array of PlantTypeResponse objects.
   */
  getPlantTypesByName(name: string): Observable<PlantTypeResponse[]> {
    const url = `${environment.platformProviderApiBaseUrl}/plant-types/by-name/${name}`;
    return this.http.get<PlantTypeResponse[]>(url);
  }

  /**
   * Retrieves all organizations from the API.
   * @returns An Observable for an array of Organization objects.
   */
  getOrganizations(): Observable<Organization[]>{
    return this.organizationsEndpoint.getAll();
  }

  /**
   * Retrieves a single organization by ID.
   * @param id - The ID of the organization.
   * @returns An Observable of the Organization object.
   */
  getOrganization(id: number): Observable<Organization>{
    return this.organizationsEndpoint.getById(id);
  }

  /**
   * Creates a new organization.
   * @param organization - The organization to create.
   * @returns An Observable of the created Organization object.
   */
  createOrganization(organization: Organization): Observable<Organization>{
    return this.organizationsEndpoint.create(organization);
  }

  /**
   * Updates an existing organization.
   * @param organization - The organization to update.
   * @returns An Observable of the updated Organization object.
   */
  updateOrganization(organization: Organization): Observable<Organization>{
    return this.organizationsEndpoint.update(organization,organization.id);
  }

  /**
   * Deletes an organization by ID.
   * @param id - The ID of the organization to delete.
   * @returns An Observable of void.
   */
  deleteOrganization(id: number): Observable<void>{
    return this.organizationsEndpoint.delete(id);
  }


  /**
   * Retrieves all subscriptions from the API.
   * @returns An Observable for an array of Subscription objects.
   */
  getSubscriptions():Observable<Subscription[]>{
    return this.subscriptionsEndpoint.getAll();
  }

  /**
   * Retrieves a single subscription by ID.
   * @param id - The ID of the subscription.
   * @returns An Observable of the Subscription object.
   */
  getSubscription(id: number): Observable<Subscription>{
    return this.subscriptionsEndpoint.getById(id);
  }

  /**
   * Creates a new subscription.
   * @param subscription - The subscription to create.
   * @returns An Observable of the created Subscription object.
   */
  createSubscription(subscription: Subscription): Observable<Subscription>{
    return this.subscriptionsEndpoint.create(subscription);
  }

  /**
   * Updates an existing subscription.
   * @param subscription - The subscription to update.
   * @returns An Observable of the updated Subscription object.
   */
  updateSubscription(subscription: Subscription): Observable<Subscription>{
    return this.subscriptionsEndpoint.update(subscription,subscription.id);
  }

  /**
   * Deletes a subscription by ID.
   * @param id - The ID of the subscription to delete.
   * @returns An Observable of void.
   */
  deleteSubscription(id: number): Observable<void>{
    return this.subscriptionsEndpoint.delete(id);
  }

  /**
   * Retrieves all plots from the API.
   * @returns An Observable for an array of Plot objects.
   */
  getPlots(): Observable<Plot[]> {
    return this.plotsEndpoint.getAll();
  }

  /**
   * Retrieves all plots associated with a specific organization.
   * @param orgId - The ID of the organization.
   * @returns An Observable of Plot entities.
   */
  getPlotsByOrganizationId(orgId: number): Observable<Plot[]> {
    return this.plotsEndpoint.getByOrganizationId(orgId);
  }

  /**
   * Creates a new plot (old method - kept for compatibility).
   * @param plot - The plot to create.
   * @returns An Observable of the created Plot object.
   */
  createPlotOld(plot: Plot): Observable<Plot> {
    return this.plotsEndpoint.create(plot);
  }

  /**
   * Updates an existing plot.
   * @param plot - The plot to update.
   * @returns An Observable of the updated Plot object.
   */
  updatePlot(plot: Plot): Observable<Plot> {
    return this.plotsEndpoint.update(plot, plot.id);
  }

  /**
   * Deletes a plot by ID.
   * @param id - The ID of the plot to delete.
   * @returns An Observable of void.
   */
  deletePlot(id: number): Observable<void> {
    return this.plotsEndpoint.delete(id);
  }

  /**
   * Retrieves all plant types from the API.
   */
  getPlantTypes(): Observable<PlantType[]>{
    return this.plantTypesEndpoint.getAll();
  }

  /**
   * Retrieves a single plant type by ID.
   */
  getPlantType(id: number): Observable<PlantType>{
    return this.plantTypesEndpoint.getById(id);
  }

  /**
   * Creates a new plant type.
   */
  createPlantType(plantType: PlantType): Observable<PlantType>{
    return this.plantTypesEndpoint.create(plantType);
  }

  /**
   * Updates an existing plant type.
   * @param plantType - The plant type to update.
   * @returns An Observable of the updated PlantType object.
   */
  updatePlantType(plantType: PlantType): Observable<PlantType>{
    return this.plantTypesEndpoint.update(plantType,plantType.id);
  }

  deletePlantType(id: number): Observable<void> {
    return this.plantTypesEndpoint.delete(id);
  }




  getProfiles() { return this.profilesEndpoint.getAll(); }
  getProfilesByIds(ids: number[]) { return this.profilesEndpoint.getByIds(ids); }
}
