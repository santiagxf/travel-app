module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)'
  ],
  collectCoverage: true,
  modulePaths: [
    '<rootDir>',
    'components'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(react-leaflet|@react-leaflet|leaflet)/)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1'
  },
};