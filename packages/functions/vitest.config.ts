import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["src/__e2e__/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**", "src/__e2e__/**", "src/**/*.d.ts"],
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
