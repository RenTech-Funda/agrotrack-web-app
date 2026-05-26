import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a Report entity in the domain layer.
 * @remarks
 * Matches the structure returned by the backend, including metrics.
 * @author FloweyTech developer team
 */

export class Report implements BaseEntity {
  private _id: number;
  private _status: string;
  private _plotId: number;
  private _organizationId: number;
  private _type: string;
  private _metricType: string;
  private _periodStart: Date;
  private _periodEnd: Date;
  private _generatedAt: Date | null;
  private _metrics: any;
  private _reportMetrics: any;

  /**
   * Initializes a new instance of the Report class.
   * @param props - The properties to initialize the report.
   */
  constructor(props: {
    id: number;
    status: string;
    plotId: number;
    organizationId: number;
    type: string;
    metricType: string;
    periodStart: Date;
    periodEnd: Date;
    generatedAt?: Date | null;
    reportMetrics?: any;
  }) {
    this._id = props.id;
    this._status = props.status;
    this._plotId = props.plotId;
    this._organizationId = props.organizationId;
    this._type = props.type;
    this._metricType = props.metricType;
    this._periodStart = props.periodStart;
    this._periodEnd = props.periodEnd;
    this._generatedAt = props.generatedAt || null;
    this._reportMetrics = props.reportMetrics || {};
  }

  get id(): number { return this._id; }
  get status(): string { return this._status; }
  get plotId(): number { return this._plotId; }
  get organizationId(): number { return this._organizationId; }
  get type(): string { return this._type; }
  get metricType(): string { return this._metricType; }
  get periodStart(): Date { return this._periodStart; }
  get periodEnd(): Date { return this._periodEnd; }
  get generatedAt(): Date | null { return this._generatedAt; }
  get reportMetrics(): any { return this._reportMetrics; }
}
