/**
 * Represents a single plant observation entity.
 */
export class PlantObservation {
  private _id: number;
  private _heightCm: number;
  private _leafCount: number;
  private _fruitCount: number;
  private _notes: string;

  /**
   * Creates an instance of PlantObservation.
   * @param observation - an object containing the properties of the plant observation.
   */
  constructor(observation: {
    id: number;
    heightCm: number;
    leafCount: number;
    fruitCount: number;
    notes: string;
  }) {
    this._id = observation.id;
    this._heightCm = observation.heightCm;
    this._leafCount = observation.leafCount;
    this._fruitCount = observation.fruitCount;
    this._notes = observation.notes;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get heightCm(): number {
    return this._heightCm;
  }

  set heightCm(value: number) {
    this._heightCm = value;
  }

  get leafCount(): number {
    return this._leafCount;
  }

  set leafCount(value: number) {
    this._leafCount = value;
  }

  get fruitCount(): number {
    return this._fruitCount;
  }

  set fruitCount(value: number) {
    this._fruitCount = value;
  }

  get notes(): string {
    return this._notes;
  }

  set notes(value: string) {
    this._notes = value;
  }
}

