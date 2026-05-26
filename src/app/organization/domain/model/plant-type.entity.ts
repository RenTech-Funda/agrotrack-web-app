/**
 * Represents a type of plant in the organization domain.
 * @remarks
 * This class can be expanded to include additional properties and methods
 * relevant to plant types as needed.
 */
export class PlantType {
  /**
   * The unique identifier of the plant type.
   */
  private _id: number;

  /**
   * The name of the plant type.
   */
  private _name: string;
  private _type: PlantTypes;
  private _isCustom: boolean;

  /**
   * Creates an instance of the PlantType entity.
   * @param plantType - an object containing the properties of the plant type.
   * @returns A new instance of PlantType.
   */
  constructor(plantType: {
    id: number;
    name: string;
    type: PlantTypes;
    isCustom: boolean;
  }) {
    this._id = plantType.id;
    this._name = plantType.name;
    this._type = plantType.type;
    this._isCustom = plantType.isCustom;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get type(): PlantTypes {
    return this._type;
  }

  set type(value: PlantTypes) {
    this._type = value;
  }

  get isCustom(): boolean {
    return this._isCustom;
  }

  set isCustom(value: boolean) {
    this._isCustom = value;
  }
}

export enum PlantTypes {
  POTATO = 'Potato',
  CORN = 'Corn',
  WHEAT = 'Wheat',
  BARLEY = 'Barley',
  COFFEE = 'Coffee',
  RICE = 'Rice',
  TOMATO = 'Tomato',
  LETTUCE = 'Lettuce',
  CARROT = 'Carrot',
  CUSTOM = 'Custom'
}
