import { userPool, userPoolClient } from "./auth.js";
import { table } from "./database.js";

// Domain configuration (optional — deploy with TLD=example.com)
const tld = process.env.TLD;
const baseDomain = tld
  ? $app.stage === "production"
    ? tld
    : `${$app.stage}.${tld}`
  : undefined;
const apiDomain = baseDomain ? `api.${baseDomain}` : undefined;

export { baseDomain };

// API Gateway
export const api = new sst.aws.ApiGatewayV2("Api", {
  domain: apiDomain ? { name: apiDomain, dns: sst.aws.dns() } : undefined,
});

// Public routes (no auth)
api.route("GET /health", {
  handler: "packages/functions/src/health.handler",
});

api.route("POST /auth/register", {
  handler: "packages/functions/src/register.handler",
  link: [userPool, userPoolClient, table],
  environment: {
    ALLOWED_SIGNUP_DOMAINS: process.env.ALLOWED_SIGNUP_DOMAINS ?? "",
  },
});

// JWT authorizer
const authorizer = api.addAuthorizer({
  name: "CognitoAuthorizer",
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
});

export const authOptions = { auth: { jwt: { authorizer: authorizer.id } } };

// Protected routes — add your authenticated endpoints here
// Example:
// api.route(
//   "GET /items",
//   {
//     handler: "packages/functions/src/listItems.handler",
//     link: [table],
//   },
//   authOptions
// );
