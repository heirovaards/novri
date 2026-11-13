import { authInstance } from '../../../auth/auth-instance';

export async function authRouteHandler(request: Request): Promise<Response> {
  return authInstance.handler(request);
}
