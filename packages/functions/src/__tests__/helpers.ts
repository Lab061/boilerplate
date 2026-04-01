import type { APIGatewayProxyEventV2 } from "aws-lambda";

export function makeApiEvent(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  options?: {
    userId?: string;
    queryStringParameters?: Record<string, string>;
  }
): Partial<APIGatewayProxyEventV2> {
  return {
    requestContext: {
      http: { method, path },
      authorizer: options?.userId
        ? { jwt: { claims: { sub: options.userId } } }
        : undefined,
    } as any,
    body: body ? JSON.stringify(body) : undefined,
    queryStringParameters: options?.queryStringParameters,
    headers: {},
    isBase64Encoded: false,
  };
}
