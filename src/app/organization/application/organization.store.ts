import {computed, Injectable, Signal, signal} from '@angular/core';
import {Organization, OrganizationStatus} from '../domain/model/organization.entity';
import {Subscription, SubscriptionPlan, SubscriptionStatus} from '../domain/model/subscription.entity';
import {OrganizationApi} from '../infrastructure/organization-api';
import {retry} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PlantType} from '../domain/model/plant-type.entity';
import {Plot} from '../domain/model/plot.entity';
import {profile} from '../../profile/domain/model/profile.entity';
import {OrganizationByOwnerResponse} from '../infrastructure/organization-by-owner-response';
import {PlotByOrganizationResponse} from '../infrastructure/plot-by-organization-response';

/**
 * State management store for organization-related data using Angular signals.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationStore {
  // Signals y Computed (Igual que antes)
  readonly organizationCount = computed(() => this.organizations().length);
  readonly subscriptionCount = computed(() => this.subscriptions().length);
  readonly planttypeCount = computed(() => this.planttypes().length);
  readonly plotyCount = computed(()=> this.plots().length);

  private readonly organizationsSignal = signal<Organization[]>([]);
  readonly organizations = this.organizationsSignal.asReadonly();

  private readonly organizationsByOwnerSignal = signal<OrganizationByOwnerResponse[]>([]);
  readonly organizationsByOwner = this.organizationsByOwnerSignal.asReadonly();

  private readonly subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscriptions = this.subscriptionsSignal.asReadonly();

  private readonly plantTypeSignal = signal<PlantType[]>([]);
  readonly planttypes = this.plantTypeSignal.asReadonly();

  private readonly plotsSignal = signal<Plot[]>([]);
  readonly plots = this.plotsSignal.asReadonly();

  private readonly plotsByOrganizationSignal = signal<PlotByOrganizationResponse[]>([]);
  readonly plotsByOrganization = this.plotsByOrganizationSignal.asReadonly();

  private readonly plantTypesListSignal = signal<any[]>([]);
  readonly plantTypesList = this.plantTypesListSignal.asReadonly();

  private readonly profileMembersSignal = signal<any[]>([]);
  readonly profileMembers = this.profileMembersSignal.asReadonly();

  private readonly profileSearchResultsSignal = signal<any[]>([]);
  readonly profileSearchResults = this.profileSearchResultsSignal.asReadonly();

  private readonly selectedPlantTypeSignal = signal<PlantType | null>(null);
  readonly selectedPlantType = this.selectedPlantTypeSignal.asReadonly();

  private readonly profilesSignal = signal<profile[]>([]);
  readonly profiles = this.profilesSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  constructor(private organizationApi: OrganizationApi) {
    // Inicialización
    this.loadOrganizations();
    this.loadSubscriptions();
    this.loadPlantTypes();
    this.loadPlots();
    this.loadProfiles();
  }

  // --- CORRECCIÓN CRÍTICA AQUÍ ---
  /**
   * Loads organizations by owner profile ID.
   */
  loadOrganizationsByOwner(ownerProfileId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.organizationApi.getOrganizationsByOwner(ownerProfileId).pipe(retry(2)).subscribe({
      next: (responses: OrganizationByOwnerResponse[]) => {
        console.log('Organizations by owner loaded:', responses);

        // 1. Guardamos la respuesta cruda por si acaso
        this.organizationsByOwnerSignal.set(responses);

        // 2. CONVERTIMOS LA RESPUESTA JSON A TU ENTIDAD 'Organization'
        // Esto es vital para que 'TaskCreate' y otros componentes lean bien la data
        const domainOrganizations = responses.map(item => {

          // Crear un objeto suscripción "dummy" con el ID que viene,
          // luego 'assignSubscriptionsToOrganizations' lo llenará con datos reales.
          const dummySubscription = new Subscription({
            id: item.subscriptionId,
            plan: SubscriptionPlan.AGROSTART, // Valor por defecto seguro
            startDate: new Date(),
            endDate: new Date(),
            status: SubscriptionStatus.ACTIVE
          });

          return new Organization({
            id: item.organizationId, // O item.id, dependiendo del JSON
            name: item.organizationName,
            status: item.isActive ? OrganizationStatus.ACTIVE : OrganizationStatus.INACTIVE,
            ownerProfileId: item.ownerProfileId,
            subscription: dummySubscription,

            // AQUÍ LA CLAVE: Asignamos el array de IDs
            profileIds: item.profileIds || [],
            members: item.profileIds || [] // Mantenemos members sincronizado para compatibilidad
          });
        });

        // Actualizamos el signal principal de organizaciones también
        // (Opcional, depende de si quieres mezclar las del dueño con todas)
        // this.organizationsSignal.set(domainOrganizations);

        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load organizations'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ... (createOrganizationWithSubscription y activateSubscription igual) ...
  createOrganizationWithSubscription(request: any): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createOrganizationWithSubscription(request).pipe(retry(2)).subscribe({
      next: response => {
        console.log('Organization created:', response);
        const profileId = sessionStorage.getItem('profile_id');
        if (profileId) {
          this.loadOrganizationsByOwner(parseInt(profileId, 10));
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create organization'));
        this.loadingSignal.set(false);
      }
    });
  }

  activateSubscription(subscriptionId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.activateSubscription(subscriptionId).pipe(retry(2)).subscribe({
      next: () => {
        const profileId = sessionStorage.getItem('profile_id');
        if (profileId) {
          this.loadOrganizationsByOwner(parseInt(profileId, 10));
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to activate subscription'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ... (getters signals igual) ...
  getOrganizationById(id: number): Signal<Organization | undefined> {
    return computed(() => id ? this.organizations().find(o => o.id === id) : undefined);
  }

  getSubscriptionById(id: number): Signal<Subscription | undefined> {
    return computed(() => id ? this.subscriptions().find(s => s.id === id) : undefined);
  }

  // ... (createPlot, loadAllPlantTypes, searchPlantTypesByName igual) ...
  createPlot(request: any, organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createPlot(request).pipe(retry(2)).subscribe({
      next: () => {
        this.loadPlotsByOrganization(organizationId);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create plot'));
        this.loadingSignal.set(false);
      }
    });
  }

  loadAllPlantTypes(): void {
    this.loadingSignal.set(true);
    this.organizationApi.getAllPlantTypes().pipe(retry(2)).subscribe({
      next: plantTypes => {
        this.plantTypesListSignal.set(plantTypes);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plant types'));
        this.loadingSignal.set(false);
      }
    });
  }

  searchPlantTypesByName(name: string): void {
    this.loadingSignal.set(true);
    this.organizationApi.getPlantTypesByName(name).pipe(retry(2)).subscribe({
      next: plantTypes => {
        this.plantTypesListSignal.set(plantTypes);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to search plant types'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ... (searchProfiles igual) ...
  searchProfiles(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) {
      this.profileSearchResultsSignal.set([]);
      return;
    }
    this.loadingSignal.set(true);
    this.organizationApi.searchProfiles(searchTerm).pipe(retry(2)).subscribe({
      next: profiles => {
        this.profileSearchResultsSignal.set(profiles);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to search profiles'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ... (addProfileToOrganization, removeProfileFromOrganization igual) ...
  addProfileToOrganization(organizationId: number, profileId: number): void {
    this.loadingSignal.set(true);
    this.organizationApi.addProfileToOrganization(organizationId, { profileId }).pipe(retry(2)).subscribe({
      next: () => {
        const ownerProfileId = sessionStorage.getItem('profile_id');
        if (ownerProfileId) {
          this.loadOrganizationsByOwner(parseInt(ownerProfileId, 10)); // Recargará con profileIds actualizado
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to add profile'));
        this.loadingSignal.set(false);
      }
    });
  }

  removeProfileFromOrganization(organizationId: number, profileId: number): void {
    this.loadingSignal.set(true);
    this.organizationApi.removeProfileFromOrganization(organizationId, { profileId }).pipe(retry(2)).subscribe({
      next: () => {
        const ownerProfileId = sessionStorage.getItem('profile_id');
        if (ownerProfileId) {
          this.loadOrganizationsByOwner(parseInt(ownerProfileId, 10));
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to remove profile'));
        this.loadingSignal.set(false);
      }
    });
  }

  clearProfileSearchResults(): void {
    this.profileSearchResultsSignal.set([]);
  }

  loadProfileMembers(profileIds: number[]): void {
    if (!profileIds || profileIds.length === 0) {
      this.profileMembersSignal.set([]);
      return;
    }
    this.loadingSignal.set(true);
    const profileRequests = profileIds.map(id => this.organizationApi.getProfileById(id));
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(profileRequests).pipe(retry(2)).subscribe({
        next: profiles => {
          this.profileMembersSignal.set(profiles);
          this.loadingSignal.set(false);
        },
        error: err => {
          this.errorSignal.set(this.formatError(err, 'Failed to load profile members'));
          this.loadingSignal.set(false);
        }
      });
    });
  }

  loadPlotsByOrganization(organizationId: number): void {
    this.loadingSignal.set(true);
    this.organizationApi.getPlotsByOrganization(organizationId).pipe(retry(2)).subscribe({
      next: plots => {
        // Carga adicional de tipos de planta
        plots.forEach(plot => {
          this.organizationApi.getPlantTypeById(plot.plantTypeId).subscribe({
            next: plantType => {
              plot.plantTypeDetails = { plantType: plantType.plantType, name: plantType.name };
              this.plotsByOrganizationSignal.set([...plots]);
            },
            error: err => console.error(err)
          });
        });
        this.plotsByOrganizationSignal.set(plots);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load plots'));
        this.loadingSignal.set(false);
      }
    });
  }

  getPlotsByOrganizationId(organizationId: number): Signal<Plot[]> {
    return computed(() => this.plots().filter(plot => plot.organizationId === organizationId));
  }

  // ... (Métodos CRUD básicos que ya tenías: addOrganization, updateOrganization, deleteOrganization...)
  addOrganization(organization: Organization): void {
    this.loadingSignal.set(true);
    this.organizationApi.createOrganization(organization).pipe(retry(2)).subscribe({
      next: created => {
        created = this.assignSubscriptionToOrganization(created);
        this.organizationsSignal.update(list => [...list, created]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create org'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateOrganization(updatedOrganization: Organization): void {
    this.loadingSignal.set(true);
    this.organizationApi.updateOrganization(updatedOrganization).pipe(retry(2)).subscribe({
      next: organization => {
        organization = this.assignSubscriptionToOrganization(organization);
        this.organizationsSignal.update(list =>
          list.map(o => o.id === organization.id ? organization : o));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update org'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteOrganization(id: number): void {
    this.loadingSignal.set(true);
    this.organizationApi.deleteOrganization(id).pipe(retry(2)).subscribe({
      next: () => {
        this.organizationsSignal.update(list => list.filter(o => o.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete org'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ... (addSubscription, updateSubscription, deleteSubscription igual) ...
  addSubscription(subscription: Subscription): void {
    this.organizationApi.createSubscription(subscription).subscribe(created =>
      this.subscriptionsSignal.update(list => [...list, created]));
  }
  updateSubscription(s: Subscription): void {
    this.organizationApi.updateSubscription(s).subscribe(updated =>
      this.subscriptionsSignal.update(list => list.map(item => item.id === updated.id ? updated : item)));
  }
  deleteSubscription(id: number): void {
    this.organizationApi.deleteSubscription(id).subscribe(() =>
      this.subscriptionsSignal.update(list => list.filter(item => item.id !== id)));
  }

  // ... (addPlantType, updatePlantType, deletePlantType igual) ...
  // ... (addPlot, updatePlot, deletePlot igual) ...

  // CARGA INICIAL
  private loadOrganizations(): void {
    this.loadingSignal.set(true);
    this.organizationApi.getOrganizations().pipe(takeUntilDestroyed()).subscribe({
      next: organizations => {
        this.organizationsSignal.set(organizations);
        this.loadingSignal.set(false);
        this.assignSubscriptionsToOrganizations();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load all organizations'));
        this.loadingSignal.set(false);
      }
    });
  }

  private loadSubscriptions(): void {
    this.organizationApi.getSubscriptions().subscribe(subs => {
      this.subscriptionsSignal.set(subs);
      this.assignSubscriptionsToOrganizations();
    });
  }

  loadPlantTypes(): void {
    this.organizationApi.getPlantTypes().subscribe(types => {
      this.plantTypeSignal.set(types);
      this.assignPlantTypesToPlots();
    });
  }

  loadPlots(): void {
    this.organizationApi.getPlots().subscribe(plots => {
      this.plotsSignal.set(plots);
      this.assignPlantTypesToPlots();
    });
  }

  private assignSubscriptionsToOrganizations(): void {
    this.organizationsSignal.update(organizations =>
      organizations.map(organization => this.assignSubscriptionToOrganization(organization))
    );
  }

  private assignSubscriptionToOrganization(organization: Organization): Organization {
    const subscription = this.subscriptions().find(
      s => s.id === organization.subscription?.id
    );
    if (subscription) organization.subscription = subscription;
    return organization;
  }

  private assignPlantTypesToPlots(): void {
    this.plotsSignal.update(plots =>
      plots.map(plot => this.assignPlantTypeToPlot(plot))
    );
  }

  private assignPlantTypeToPlot(plot: Plot): Plot {
    const plantType = this.planttypes().find(pt => pt.id === plot.plantType?.id);
    if (plantType) plot.plantType = plantType;
    return plot;
  }

  loadProfiles(): void {
    this.organizationApi.getProfiles().subscribe(profiles => this.profilesSignal.set(profiles));
  }

  getMembersOfOrganization(orgId: number): Signal<profile[]> {
    return computed(() => {
      const org = this.organizations().find(o => o.id === orgId);
      if (!org) return [];
      const ids = new Set(org.members); // Usa members que ya está sincronizado con profileIds
      return this.profiles().filter(p => ids.has(p.id));
    });
  }

  getAvailableProfilesForOrganization(orgId: number): Signal<profile[]> {
    return computed(() => {
      const org = this.organizations().find(o => o.id === orgId);
      if (!org) return this.profiles();
      const excluded = new Set<number>([org.ownerProfileId, ...org.members]);
      return this.profiles().filter(p => !excluded.has(p.id));
    });
  }

  // --- CORRECCIÓN EN AGREGAR/QUITAR MIEMBROS ---
  // Debemos actualizar tanto 'members' como 'profileIds' en el objeto local
  addMemberToOrganization(orgId: number, profileId: number): void {
    const org = this.organizations().find(o => o.id === orgId);
    if (!org) return;
    if (org.members.includes(profileId)) return;

    const updated = new Organization({
      id: org.id,
      name: org.name,
      ownerProfileId: org.ownerProfileId,
      members: [...org.members, profileId], // Actualiza members
      profileIds: [...org.profileIds, profileId], // Actualiza profileIds
      status: org.status,
      subscription: org.subscription
    });

    this.updateOrganization(updated);
  }

  removeMemberFromOrganization(orgId: number, profileId: number): void {
    const org = this.organizations().find(o => o.id === orgId);
    if (!org) return;
    if (!org.members.includes(profileId)) return;
    if (profileId === org.ownerProfileId) return;

    const updated = new Organization({
      id: org.id,
      name: org.name,
      ownerProfileId: org.ownerProfileId,
      members: org.members.filter(id => id !== profileId), // Filtra members
      profileIds: org.profileIds.filter(id => id !== profileId), // Filtra profileIds
      status: org.status,
      subscription: org.subscription
    });

    this.updateOrganization(updated);
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
  // AGREGAR ESTOS MÉTODOS A TU OrganizationStore SI LOS BORRASTE:

  addPlantType(plantType: PlantType): void {
    this.loadingSignal.set(true);
    this.organizationApi.createPlantType(plantType).pipe(retry(2)).subscribe({
      next: createdType => {
        this.plantTypeSignal.update(types => [...types, createdType]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set('Failed to create plant type');
        this.loadingSignal.set(false);
      }
    });
  }

  updatePlot(updatedPlot: Plot): void {
    this.loadingSignal.set(true);
    this.organizationApi.updatePlot(updatedPlot).pipe(retry(2)).subscribe({
      next: plot => {
        // Actualiza la lista local de plots
        this.plotsSignal.update(plots => plots.map(p => p.id === plot.id ? plot : p));
        // Y también la lista filtrada por organización
        this.loadPlotsByOrganization(plot.organizationId);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set('Failed to update plot');
        this.loadingSignal.set(false);
      }
    });
  }

  deletePlot(id: number): void {
    this.loadingSignal.set(true);
    this.organizationApi.deletePlot(id).pipe(retry(2)).subscribe({
      next: () => {
        this.plotsSignal.update(plots => plots.filter(p => p.id !== id));
        // Si necesitas actualizar la vista filtrada, podrías necesitar recargar o filtrar localmente también
        // this.plotsByOrganizationSignal.update(...)
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set('Failed to delete plot');
        this.loadingSignal.set(false);
      }
    });
  }
}
