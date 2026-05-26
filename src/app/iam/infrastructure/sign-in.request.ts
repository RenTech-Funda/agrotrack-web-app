/**
 * @summary Request interface for sign-in API calls in the infrastructure layer of the IAM bounded context.
 * @description Defines the structure of the JSON payload required to authenticate a user, containing their identifier and password.
 * @author FloweyTech
 */
export interface SignInRequest {
  identifier: string;
  password: string;
}
