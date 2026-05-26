import {SignInResource, SignInResponse} from './sign-in.response'
import {SignInRequest} from './sign-in.request';
import {SignInCommand} from '../domain/model/sign-in.command';

/**
 * @summary Assembler for converting between sign-in commands, requests, and responses in the infrastructure layer.
 * @description Provides methods to map domain commands to API requests and API responses to domain-consumable resources, ensuring decoupling between layers.
 * @author FloweyTech
 */
export class SignInAssembler {
  /**
   * @summary Converts a sign-in API response to a sign-in resource.
   * @description Extracts necessary data (id, username, token, role) from the server response to create a usable resource object.
   * @param response The raw response received from the authentication API.
   * @returns The assembled sign-in resource containing user details and the session token.
   */
  toResourceFromResponse(response: SignInResponse): SignInResource {
    return {
      id: response.id,
      username: response.username,
      token: response.token,
      role: response.role
    } as SignInResource;
  }

  /**
   * @summary Converts a sign-in domain command to a sign-in API request.
   * @description Maps the user's input (identifier and password) from the command object into the JSON structure required by the backend API.
   * @param command The sign-in command containing the user's credentials.
   * @returns The assembled sign-in request object ready to be sent to the API.
   */
  toRequestFromCommand(command: SignInCommand): SignInRequest {
    return {
      identifier: command.identifier,
      password: command.password,
    } as SignInRequest;
  }
}
