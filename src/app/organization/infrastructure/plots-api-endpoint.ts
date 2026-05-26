import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Plot } from '../domain/model/plot.entity';
import { PlotResource, PlotsResponse } from './plots-response';
import { PlotAssembler } from './plot-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class PlotsApiEndpoint extends BaseApiEndpoint<Plot, PlotResource, PlotsResponse, PlotAssembler> {
  private readonly baseUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlotsEndpointPath}`;

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlotsEndpointPath}`, new PlotAssembler());
  }

  getByOrganizationId(orgId: number): Observable<Plot[]> {
    const url = `${this.baseUrl}?organizationId=${orgId}`;
    return this.http.get<PlotsResponse>(url).pipe(
      map((response: PlotsResponse) => this.assembler.toEntitiesFromResponse(response))
    );
  }
}
