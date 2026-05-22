import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.SMOKE_PORT ?? 3001);
const baseURL = process.env.SMOKE_BASE_URL ?? `http://127.0.0.1:${port}`;
const browserChannel = process.env.SMOKE_BROWSER_CHANNEL ?? "chrome";

export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: browserChannel,
      use: { ...devices["Desktop Chrome"], channel: browserChannel },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "local-smoke-secret",
    },
  },
});
