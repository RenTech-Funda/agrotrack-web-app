import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {Subscription, SubscriptionPlan} from './subscription.entity';

/**
 * Represents an Organization entity in the application.
 * @remarks
 * This class is used as a domain model for categories in the learning context.
 * It implements the BaseEntity interface to ensure consistency across entities.
 * @see {@link BaseEntity}
 */

export class Organization implements BaseEntity {
  /**
   * The unique identifier of the organization.
   */
  private _id: number;

  /**
   * The name of the organization.
   */
  private _name: string;


  private _members: Array<number>;

  private _status: OrganizationStatus;

  private _subscription : Subscription;

  private _ownerProfileId: number;

  profileIds: number[];


  /**
   * Creates an instance of the Organization entity.
   * @paran organization - an object containing the properties of the organization.
   * @returns A new instance of Organization.
   */
  constructor(organization: {
    id: number;
    name: string;
    members: Array<number>;
    status: OrganizationStatus;
    subscription : Subscription;
    ownerProfileId: number;
    profileIds?: number[]
    }) {

    this._id = organization.id;
    this._name = organization.name;
    this._members = organization.members;
    this._status = organization.status;
    this._subscription = organization.subscription;
    this._ownerProfileId = organization.ownerProfileId;
    this.profileIds = organization.profileIds || [];

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

  get members(): Array<number>{
    return this._members;
  }

  set members(members: Array<number>){
    this._members = members;
  }

  get status(): OrganizationStatus {
    return this._status;
  }
  set status(value: OrganizationStatus){
    this._status = value;
  }

  get maxPlots(): number {
    switch (this._subscription.plan){
      case SubscriptionPlan.AGROSTART:
        return 5;
      case SubscriptionPlan.AGROSMART:
        return 15;
      case SubscriptionPlan.AGROEXPERT:
        return 50;
      default:
        return 0;
    }
  }

  get subscription(): Subscription {
    return this._subscription;
  }
  set subscription(value: Subscription){
    this._subscription = value;
  }
  get ownerProfileId() { return this._ownerProfileId; }
  set ownerProfileId(v: number) { this._ownerProfileId = v; }

}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
