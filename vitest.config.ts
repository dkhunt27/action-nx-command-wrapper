import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // include: ['src/**/*.test.ts'],
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov'],
      include: ['src/**/*.ts'],
      thresholds: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
