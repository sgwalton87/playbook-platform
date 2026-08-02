import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [
      "node_modules/**",
      "tests/e2e/**",
    ],
  },
});
