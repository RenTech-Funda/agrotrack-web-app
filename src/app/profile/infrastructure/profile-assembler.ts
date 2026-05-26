// profiles/infrastructure/profile-assembler.ts
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { profile } from '../domain/model/profile.entity';
import { ProfileResource } from './profiles-response';

export class ProfileAssembler implements BaseAssembler<profile, ProfileResource, ProfileResource[]> {
  toEntityFromResource(r: ProfileResource): profile {
    return new profile(r.id, r.name, r.avatarUrl || '');
  }
  toResourceFromEntity(e: profile): ProfileResource {
    return { id: e.id, name: e.name, avatarUrl: e.avatarUrl };
  }
  toEntitiesFromResponse(res: ProfileResource[]): profile[] {
    return res.map(r => this.toEntityFromResource(r));
  }
}
