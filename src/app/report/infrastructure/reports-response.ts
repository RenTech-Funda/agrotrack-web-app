import { ReportResource } from "./report-resource";

/**
 * API Response: ReportsResponse
 * Represents a response containing multiple reports.
 */
export interface ReportsResponse {
  reports: ReportResource[];
}
