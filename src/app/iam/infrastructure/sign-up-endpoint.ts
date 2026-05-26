import {environment} from '../../../environments/environment';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {HttpClient} from '@angular/common/http';
import {SignUpAssembler} from './sign-up-assembler';
import {SignUpResource, SignUpResponse} from './sign-up.response';
import {Observable} from 'rxjs';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {catchError, map} from 'rxjs/operators';

const signUpApiEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignUpEndpointPath}`;

/**
 * API endpoint for handling user sign-up operations in the infrastructure layer of the IAM bounded context.
 * Extends ErrorHandlingEnabledBaseType for error management.
 */
export class SignUpApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of SignUpApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(private http: HttpClient, private assembler: SignUpAssembler) {
    super();
  }

  /**
   * Performs the sign-up operation by sending a POST request.
   * @param signUpCommand The sign-up command containing user details.
   * @returns An Observable of the sign-up resource.
   */
  signUp(signUpCommand: SignUpCommand): Observable<SignUpResource> {
    const signUpRequest = this.assembler.toRequestFromCommand(signUpCommand);
    return this.http.post<SignUpResponse>(signUpApiEndpointUrl, signUpRequest).pipe(
      map(response => this.assembler.toResourceFromResponse(response)),
      catchError(this.handleError('Failed to sign-up'))
    );
  }
}
