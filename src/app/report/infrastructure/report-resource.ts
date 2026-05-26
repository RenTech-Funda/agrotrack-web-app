/**
 * Resource interface for report data from the API.
 * @remarks
 * Represents the JSON structure returned by the backend.
 * @author FloweyTech developer team
 */
export interface ReportResource {
  id: number;
  status: string;
  plotId: number;
  organizationId: number;
  type: string;
  metricType: string;
  reportMetrics: {
    averageValue: number;
    maxValue: number;
    minValue: number;
    dataCount: number;
  };
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
}
