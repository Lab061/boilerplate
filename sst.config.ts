/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "my-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const auth = await import("./infra/auth.js");
    await import("./infra/database.js");
    const api = await import("./infra/api.js");
    const frontend = await import("./infra/frontend.js");

    return {
      api: api.api.url,
      site: frontend.site.url,
      userPoolId: auth.userPool.id,
      userPoolClientId: auth.userPoolClient.id,
    };
  },
});
