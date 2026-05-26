import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user.role.enum';

/**
 * @summary Represents a user entity in the domain layer of the IAM bounded context.
 * @description Encapsulates the core identity information of a user, including credentials, role, status, and profile details. Implements the BaseEntity interface.
 * @author FloweyTech
 */
export class User implements BaseEntity {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  name?: string;
  avatarUrl?: string;

  /**
   * @summary Creates a new User instance.
   * @description Initializes the user entity with the provided properties. Sets the status to ACTIVE by default if not provided.
   * @param props An object containing the user's initialization data.
   */
  constructor(props: {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    status?: UserStatus;
    name?: string;          // <-- nuevo
    avatarUrl?: string;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status ?? UserStatus.ACTIVE;
    this.name = props.name;
    this.avatarUrl = props.avatarUrl;
  }

  matchCredentials(email: string, password: string): boolean {
    return this.email === email && this.passwordHash === password;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isAgronomist(): boolean {
    return this.role === UserRole.AGRONOMIST;
  }

  isFarmer(): boolean {
    return this.role === UserRole.FARMER;
  }
}
