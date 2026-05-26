/**
 * @summary Command object for user sign-in operations in the domain layer of the IAM bounded context.
 * @description Encapsulates the credentials (identifier and password) required to authenticate a user in the system.
 * @author FloweyTech
 */
export class SignInCommand {
  identifier: string; // Puede ser username o email
  password: string;

  /**
   * @summary Creates a new instance of SignInCommand.
   * @description Initializes the command with the provided credentials.
   * @param resource An object containing the identifier and password.
   */
  constructor(resource: {identifier: string, password: string}) {
    this.identifier = resource.identifier;
    this.password = resource.password;
  }
}


