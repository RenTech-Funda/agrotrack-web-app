import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class EnvironmentalReading implements BaseEntity {
  private _id: number;
  private _plotId: number;
  private _type: ReadingType;
  private _value: number;
  private _unit: string;
  private _measuredAt: Date;

  /**
   * Creates an instance of the EnvironmentalReading entity.
   * @param reading - an object containing the properties of the environmental reading.
   * @returns A new instance of EnvironmentalReading.
   */
  constructor(reading: {
    id: number;
    plotId: number;
    type: ReadingType;
    value: number;
    unit: string;
    measuredAt: Date;
  }) {
    this._id = reading.id;
    this._plotId = reading.plotId;
    this._type = reading.type;
    this._value = reading.value;
    this._unit = reading.unit;
    this._measuredAt = reading.measuredAt;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get plotId(): number {
    return this._plotId;
  }

  set plotId(value: number) {
    this._plotId = value;
  }

  get type(): ReadingType {
    return this._type;
  }

  set type(value: ReadingType) {
    this._type = value;
  }

  get value(): number {
    return this._value;
  }
  set value(value: number) {
    this._value = value;
  }

  get unit(): string {
    return this._unit;
  }

  set unit(value: string) {
    this._unit = value;
  }

  get measuredAt(): Date {
    return this._measuredAt;
  }
  set measuredAt(value: Date) {
    this._measuredAt = value;
  }

  /**
   * Evaluates the current reading against predefined safe thresholds.
   * @returns An alert message if out of range, otherwise null.
   */
  evaluate(): string | null {
    let min = 0;
    let max = 0;

    // Define thresholds by reading type
    switch (this._type) {
      case ReadingType.TEMPERATURE:
        min = 15;
        max = 35; // Celsius
        break;
      case ReadingType.HUMIDITY:
        min = 40;
        max = 80; // Percent
        break;
      case ReadingType.PH_LEVEL:
        min = 5.5;
        max = 7.5; // Neutral range
        break;
    }

    // Check if the reading is out of range
    if (this._value < min || this._value > max) {
      return `⚠️ ${this._type} alert: ${this._value}${this._unit} (Expected range: ${min}-${max})`;
    }

    return null; // Reading is within normal range
  }
}


export enum ReadingType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PH_LEVEL = 'PH_LEVEL'
}
