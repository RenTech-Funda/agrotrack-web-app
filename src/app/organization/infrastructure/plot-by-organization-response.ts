export interface PlotByOrganizationResponse {
  id: number;
  plotId: number;
  plotName: string;
  size: number;
  unit: string;
  plantTypeId: number;
  location: string;
  organizationId: number;
  plantTypeDetails?: {
    plantType: string;
    name: string;
  };
}
