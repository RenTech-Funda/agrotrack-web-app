/**
 * @summary Request interface for sign-up API calls in the infrastructure layer of the IAM bounded context.
 * @description Defines the structure of the JSON payload required to register a new user, including personal details, credentials, and role.
 * @author FloweyTech
 */
export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}
