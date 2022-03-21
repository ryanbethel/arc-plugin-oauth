// playwright.config.ts
// import { PlaywrightTestConfig } from '@playwright/test';
const mockFolder = process.env.MOCK_FOLDER || 'basic'
const config = {
  webServer: {
    command: `cd test/mocks/${mockFolder} && npm i && npm start`,
    port: 3333,
    timeout: 120 * 1000
  },
  timeout: 60000 // Timeout is shared between all tests.
}
export default config
