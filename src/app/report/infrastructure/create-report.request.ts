/**
 * Request interface for report creation API calls.
 * @remarks
 * Represents the JSON body required by POST /api/v1/organizations/{organizationId}/plots/{plotId}/reports.
 * @author FloweyTech developer team
 */
export interface CreateReportRequest {
  type: string;
  metricType: string;
  periodStart: string;
  periodEnd: string;
}
