import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {},
  },
  env: {
    WORSHIPPER_EMAIL: 'worshipper@test.com',
    WORSHIPPER_PASSWORD: 'Password123!',
    ADMIN_EMAIL: 'admin@test.com',
    ADMIN_PASSWORD: 'Password123!',
    OFFICER_EMAIL: 'officer@test.com',
    OFFICER_PASSWORD: 'Password123!',
  },
});
