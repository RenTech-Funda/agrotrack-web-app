export interface OrganizationByOwnerResponse {
  id: number;
  organizationId: number;
  organizationName: string;
  isActive: boolean;
  maxPlots: number;
  ownerProfileId: number;
  profileIds: number[];
  subscriptionId: number;
}
