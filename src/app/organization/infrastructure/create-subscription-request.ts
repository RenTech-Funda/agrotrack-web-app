export interface CreateSubscriptionRequest {
  subscriptionPlan: string;
  durationMonths: number;
  organizationName: string;
}

export interface CreateSubscriptionResponse {
  id: number;
  subscriptionId: number;
  organizationId: number;
  organizationName: string;
  subscriptionPlan: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxPlots: number;
  ownerProfileId: number;
}
