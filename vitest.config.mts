import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', '**/*.ui.test.tsx'],
    environment: 'node',
    coverage: { include: ['src/domain/**', 'src/services/storage.ts'] },
  },
});
