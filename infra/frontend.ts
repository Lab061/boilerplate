import { userPool, userPoolClient } from "./auth.js";
import { api, baseDomain } from "./api.js";

const wwwDomain = baseDomain ? `www.${baseDomain}` : undefined;

export const site = new sst.aws.StaticSite("Frontend", {
  path: "packages/frontend",
  domain: wwwDomain ? { name: wwwDomain, dns: sst.aws.dns() } : undefined,
  build: {
    command: "npm run build",
    output: "dist",
  },
  dev: {
    command: "npm run dev -- --host",
  },
  environment: {
    VITE_API_URL: api.url,
    VITE_USER_POOL_ID: userPool.id,
    VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
  },
});
