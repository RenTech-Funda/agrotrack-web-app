import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Subscription implements BaseEntity{
  private _id: number;
  private _plan: SubscriptionPlan;
  private _startDate: Date;
  private _endDate: Date;
  private _status: SubscriptionStatus;
  //private _subscriptionPriceAmount: decimal;
  //private _

  /**
   * Creates an instance of the Subscription entity.
   * @param subscription - an object containing the properties of the subscription.
   * @returns A new instance of Subscription.
   */
  constructor(subscription: {
    id: number;
    plan: SubscriptionPlan;
    startDate: string | Date;
    endDate: string | Date;
    status: SubscriptionStatus;
  }) {
    this._id = subscription.id;
    this._plan = subscription.plan;
    this._startDate = new Date(subscription.startDate);
    this._endDate = new Date(subscription.endDate);
    this._status = subscription.status;
  }

  // Getters and Setters
   get id(): number {
     return this._id;
   }
   set id(value: number){
    this._id = value;
   }

   get plan(): SubscriptionPlan {
    return this._plan;
   }
   set plan(value: SubscriptionPlan){
    this._plan = value;
   }

   get startDate(): Date {
    return this._startDate;
   }
   set startDate(value: Date){
    this._startDate = value;
   }

   get endDate(): Date {
    return this._endDate;
   }
   set endDate(value: Date){
    this._endDate = value;
   }

   get status(): SubscriptionStatus {
    return this._status;
   }
   set status(value: SubscriptionStatus){
    this._status = value;
   }
}

export enum SubscriptionPlan {
  AGROSTART = 'AgroStart',
  AGROSMART = 'AgroSmart',
  AGROEXPERT = 'AgroExpert'
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  CANCELED = 'Canceled'
}
