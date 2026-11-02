import { describe, it, expect } from "vitest";
import { handler } from "../health.js";

describe("GET /health", () => {
  it("should report the service as ok", async () => {
    const result = (await handler({} as any, {} as any, {} as any)) as any;

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ status: "ok" });
  });
});
