import { PlantObservation } from './plant-observation.entity';

/**
 * Represents the average values calculated from plant observations.
 */
export class SampleAverage {
  private _avgHeightCm: number;
  private _avgLeafCount: number;
  private _avgFruitCount: number;

  /**
   * Creates an instance of SampleAverage.
   * @param average - an object containing the average values.
   */
  constructor(average: {
    avgHeightCm: number;
    avgLeafCount: number;
    avgFruitCount: number;
  }) {
    this._avgHeightCm = average.avgHeightCm;
    this._avgLeafCount = average.avgLeafCount;
    this._avgFruitCount = average.avgFruitCount;
  }

  get avgHeightCm(): number {
    return this._avgHeightCm;
  }

  set avgHeightCm(value: number) {
    this._avgHeightCm = value;
  }

  get avgLeafCount(): number {
    return this._avgLeafCount;
  }

  set avgLeafCount(value: number) {
    this._avgLeafCount = value;
  }

  get avgFruitCount(): number {
    return this._avgFruitCount;
  }

  set avgFruitCount(value: number) {
    this._avgFruitCount = value;
  }
}

/**
 * Represents a plant sampling session entity.
 */
export class PlantSamplingSession {
  private _id: number;
  private _plotId: number;
  private _sampledAt: string;
  private _average: SampleAverage;
  private _observations: PlantObservation[];

  /**
   * Creates an instance of PlantSamplingSession.
   * @param session - an object containing the properties of the sampling session.
   */
  constructor(session: {
    id: number;
    plotId: number;
    sampledAt: string;
    average: SampleAverage;
    observations: PlantObservation[];
  }) {
    this._id = session.id;
    this._plotId = session.plotId;
    this._sampledAt = session.sampledAt;
    this._average = session.average;
    this._observations = session.observations;
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

  get sampledAt(): string {
    return this._sampledAt;
  }

  set sampledAt(value: string) {
    this._sampledAt = value;
  }

  get average(): SampleAverage {
    return this._average;
  }

  set average(value: SampleAverage) {
    this._average = value;
  }

  get observations(): PlantObservation[] {
    return this._observations;
  }

  set observations(value: PlantObservation[]) {
    this._observations = value;
  }
}
