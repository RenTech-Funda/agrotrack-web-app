import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {PlantType} from './plant-type.entity';

export class Plot implements BaseEntity{
  private _id: number;
  private _name: string
  private _area: number;
  private _location: string;
  private _plantType: PlantType;
  private _organizationId: number;

  /**
   * Creates an instance of the Plot entity.
   * @param plot - an object containing the properties of the plot.
   * @returns A new instance of Plot.
   */
  constructor(plot: {
    id: number;
    name: string;
    area: number;
    location: string;
    plantType: PlantType;
    organizationId: number;
  }){
    this._id = plot.id;
    this._name = plot.name;
    this._area = plot.area;
    this._location = plot.location;
    this._plantType = plot.plantType;
    this._organizationId = plot.organizationId;
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

  get area(): number {
    return this._area;
  }
  set area(value: number) {
    this._area = value;
  }

  get location(): string {
    return this._location;
  }
  set location(value: string) {
    this._location = value;
  }

  get plantType(): PlantType {
    return this._plantType;
  }
  set plantType(value: PlantType) {
    this._plantType = value;
  }

  get organizationId(): number {
    return this._organizationId;
  }
  set organizationId(value: number) {
    this._organizationId = value;
  }


}
