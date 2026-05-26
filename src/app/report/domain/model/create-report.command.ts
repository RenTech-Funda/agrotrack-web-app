/**
 * Command object for creating a new report in the domain layer.
 * @remarks
 * Encapsulates the necessary data to request a report creation, including path parameters and body data.
 * @author FloweyTech developer team
 */
export class CreateReportCommand {
  private _organizationId: number;
  private _plotId: number;
  private _type: string;
  private _metricType: string;
  private _periodStart: string; // Usamos string para facilitar el input del formulario (YYYY-MM-DD)
  private _periodEnd: string;

  constructor(props: {
    organizationId: number;
    plotId: number;
    type: string;
    metricType: string;
    periodStart: string;
    periodEnd: string;
  }) {
    this._organizationId = props.organizationId;
    this._plotId = props.plotId;
    this._type = props.type;
    this._metricType = props.metricType;
    this._periodStart = props.periodStart;
    this._periodEnd = props.periodEnd;
  }

  get organizationId(): number { return this._organizationId; }
  get plotId(): number { return this._plotId; }
  get type(): string { return this._type; }
  get metricType(): string { return this._metricType; }
  get periodStart(): string { return this._periodStart; }
  get periodEnd(): string { return this._periodEnd; }
}
