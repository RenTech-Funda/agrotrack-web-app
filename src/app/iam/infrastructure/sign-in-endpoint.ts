import {environment} from '../../../environments/environment';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {HttpClient} from '@angular/common/http';
import {SignInAssembler} from './sign-in-assembler';
import {SignInCommand} from '../domain/model/sign-in.command';
import {Observable} from 'rxjs';
import {SignInResource, SignInResponse} from './sign-in.response';
import {catchError, map} from 'rxjs/operators';


const signInApiEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignInEndpointPath}`;

/**
 * API endpoint for handling user sign-in operations in the infrastructure layer of the IAM bounded context.
 * Extends ErrorHandlingEnabledBaseType for error management.
 */
export class SignInApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of SignInApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(private http: HttpClient, private assembler: SignInAssembler) {
    super();
  }

  /**
   * Performs the sign-in operation by sending a POST request.
   * @param signInCommand The sign-in command containing user credentials.
   * @returns An Observable of the sign-in resource.
   */
  signIn(signInCommand: SignInCommand): Observable<SignInResource> {
    const signInRequest = this.assembler.toRequestFromCommand(signInCommand);
    return this.http.post<SignInResponse>(signInApiEndpointUrl, signInRequest).pipe(
      map(response => this.assembler.toResourceFromResponse(response)),
      catchError(this.handleError('Failed to sign-in'))
    );
  }
}

