// backend/jest.config.js
export default {
  // Indicates that the test environment is node.
  testEnvironment: 'node',
  // By default, Jest doesn't transform anything from node_modules.
  // We don't need any special transforms for this project since we're using native ES modules.
  transform: {},
};
