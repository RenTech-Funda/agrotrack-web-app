import {SignUpRequest} from './sign-up.request';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource, SignUpResponse} from './sign-up.response';

/**
 * @summary Assembler for converting between sign-in commands, requests, and responses in the infrastructure layer.
 * @description Provides methods to map domain commands to API requests and API responses to domain-consumable resources, ensuring decoupling between layers.
 * @author FloweyTech
 */
export class SignUpAssembler {

  /**
   * @summary Converts a sign-up API response to a sign-up resource.
   * @description Extracts key identifier information (id, username) from the server response to create a usable resource object.
   * @param response The raw response received from the registration API.
   * @returns The assembled sign-up resource confirming the user creation.
   */
  toResourceFromResponse(response: SignUpResponse): SignUpResource {
    return {
      id: response.id,
      username: response.username,
    } as SignUpResource;
  }

  /**
   * @summary Converts a sign-up domain command to a sign-up API request.
   * @description Maps the user's registration details (credentials, personal info, role) from the command object into the JSON structure required by the backend API.
   * @param command The sign-up command containing the new user's details.
   * @returns The assembled sign-up request object ready to be sent to the API.
   */
  toRequestFromCommand(command: SignUpCommand): SignUpRequest {
    return {
      username: command.username,
      email: command.email,
      password: command.password,
      role: command.role,
      firstName: command.firstName,
      lastName: command.lastName,
      photoUrl: command.photoUrl
    } as SignUpRequest;
  }
}
