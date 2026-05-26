import {BaseEntity} from '../../../shared/domain/model/base-entity';

/**
 * @author FloweyTech
 * @summary Domain entity that represents a profile.
 */
export class profile implements BaseEntity {

  constructor(private _id: number,
              private _name: string,
              private _avatarUrl: string){}

  get name(){ return this._name; }
  get id() {return this._id}
  get avatarUrl(){ return this._avatarUrl; }
}
