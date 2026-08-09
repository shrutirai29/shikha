import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 10000,
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://localhost:27017/shikha-test",
      JWT_SECRET: "test-jwt-secret",
      JWT_REFRESH_SECRET: "test-jwt-refresh-secret",
    },
  },
});
