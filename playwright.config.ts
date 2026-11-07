import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: { baseURL: 'http://localhost:3000', ...devices['iPhone 13'], browserName: 'chromium', contextOptions: { reducedMotion: 'reduce' } },
  webServer: { command: 'npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
  reporter: [['list'], ['html', { open: 'never' }]],
})
