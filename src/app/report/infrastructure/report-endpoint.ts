import {Injectable} from '@angular/core';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ReportAssembler} from './report-assembler';
import {CreateReportCommand} from '../domain/model/create-report.command';
import { Observable, catchError, map } from 'rxjs';
import {ReportResource} from './report-resource';
import {GetReportsQuery} from '../domain/model/get-reports.query';


/**
 * API endpoint for handling report operations in the infrastructure layer.
 * @author FloweyTech developer team
 */
@Injectable({
  providedIn: 'root'
})
export class ReportEndpoint extends ErrorHandlingEnabledBaseType {
  private baseUrl = `${environment.platformProviderApiBaseUrl}`; // e.g. /api/v1

  constructor(
    private http: HttpClient,
    private assembler: ReportAssembler
  ) {
    super();
  }

  /**
   * Sends a POST request to create a new report.
   * @param command - The command containing path params and body data.
   * @returns An Observable of the created ReportResource.
   */
  createReport(command: CreateReportCommand): Observable<ReportResource> {
    // Construct dynamic URL: /organizations/{orgId}/plots/{plotId}/reports
    const url = `${this.baseUrl}/organizations/${command.organizationId}/plots/${command.plotId}/reports`;

    const requestBody = this.assembler.toRequestFromCommand(command);

    return this.http.post<ReportResource>(url, requestBody).pipe(
      map(resource => resource), // No conversion needed here, handled in API facade or Store
      catchError(this.handleError('Failed to create report'))
    );
  }
  /**
   * Sends a GET request to retrieve all reports for the authenticated user.
   * @param query - The query object (currently empty, but prepared for filters).
   * @returns An Observable of ReportResource array.
   * @author FloweyTech developer team
   */
  fetchReports(query: GetReportsQuery): Observable<ReportResource[]> {
    // El endpoint es base + /reports. El interceptor pondrá el token.
    const url = `${this.baseUrl}/reports`;

    // Si tuvieras filtros en el query, usarías HttpParams aquí.

    return this.http.get<ReportResource[]>(url).pipe(
      catchError(this.handleError('Failed to fetch reports'))
    );
  }

  /**
   * Gets a specific report by ID.
   * @param id - The report ID.
   * @returns An Observable of the ReportResource.
   */
  getReportById(id: number): Observable<ReportResource> {
    const url = `${this.baseUrl}/reports/${id}`;
    return this.http.get<ReportResource>(url).pipe(
      catchError(this.handleError('Failed to fetch report'))
    );
  }

}
