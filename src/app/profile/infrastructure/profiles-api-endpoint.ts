import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {profile} from '../domain/model/profile.entity';
import {ProfileResource} from './profiles-response';
import {ProfileAssembler} from './profile-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfilesApiEndpoint extends BaseApiEndpoint<
  profile, ProfileResource, ProfileResource[], ProfileAssembler
> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}/profiles`, new ProfileAssembler());
  }


  getByIds(ids: number[]) {
    const params = ids.map(id => `id=${id}`).join('&');

    return this.http.get<ProfileResource[]>(
      `${environment.platformProviderApiBaseUrl}/profiles?${params}`
    );
  }
}

