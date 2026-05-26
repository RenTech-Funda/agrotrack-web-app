/**
 * @summary Command object for user sign-up operations in the domain layer of the IAM bounded context.
 * @description Encapsulates all necessary data required to register a new user in the system, including credentials, role assignment, and personal information.
 * @author FloweyTech
 */
export class SignUpCommand {
  username: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  photoUrl: string;

  /**
   * @summary Creates a new instance of SignUpCommand.
   * @description Initializes the command with the provided registration details.
   * @param resource An object containing all necessary fields for user registration.
   */
  constructor(resource: {
    username: string,
    email: string,
    password: string,
    role: string,
    firstName: string,
    lastName: string,
    photoUrl: string
  }) {
    this.username = resource.username;
    this.email = resource.email;
    this.password = resource.password;
    this.role = resource.role;
    this.firstName = resource.firstName;
    this.lastName = resource.lastName;
    this.photoUrl = resource.photoUrl;
  }
}

