module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.ui.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.cjs'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
