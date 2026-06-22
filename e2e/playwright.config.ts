import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  use: { baseURL: 'http://localhost:3000' },
  webServer: [
    { command: 'npm run dev --workspace=apps/api', port: 4000, reuseExistingServer: true },
    { command: 'npm run dev --workspace=apps/web', port: 3000, reuseExistingServer: true },
  ],
})
