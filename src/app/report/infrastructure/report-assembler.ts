import { Report } from "../domain/model/report.entity";
import { ReportResource } from "./report-resource";
import {CreateReportCommand} from '../domain/model/create-report.command';
import {CreateReportRequest} from './create-report.request';

/**
 * Assembler for converting between report commands, requests, and entities.
 * @author FloweyTech developer team
 */
export class ReportAssembler {
  /**
   * Converts a CreateReportCommand to a CreateReportRequest (Body only).
   * @param command - The creation command.
   * @returns The request body object.
   */
  toRequestFromCommand(command: CreateReportCommand): CreateReportRequest {
    return {
      type: command.type,
      metricType: command.metricType,
      periodStart: command.periodStart,
      periodEnd: command.periodEnd
    };
  }

  /**
   * Converts a ReportResource (JSON) to a Report (Entity).
   * @param resource - The resource from the API.
   * @returns The domain entity.
   */
  toEntityFromResource(resource: ReportResource): Report {
    return new Report({
      id: resource.id,
      status: resource.status,
      plotId: resource.plotId,
      organizationId: resource.organizationId,
      type: resource.type,
      metricType: resource.metricType,
      periodStart: new Date(resource.periodStart),
      periodEnd: new Date(resource.periodEnd),
      generatedAt: resource.generatedAt ? new Date(resource.generatedAt) : null,
      reportMetrics: resource.reportMetrics ? {
        averageValue: resource.reportMetrics.averageValue,
        maxValue: resource.reportMetrics.maxValue,
        minValue: resource.reportMetrics.minValue,
        dataCount: resource.reportMetrics.dataCount
      } : undefined
    });
  }

  /**
   * Converts an array of ReportResources (JSON) to an array of Report entities.
   * @param resources - The array of resources from the API.
   * @returns An array of domain entities.
   * @author FloweyTech developer team
   */
  toEntitiesFromResources(resources: ReportResource[]): Report[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}
