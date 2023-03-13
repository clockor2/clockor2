const test = process.env.NODE_ENV === 'test';

module.exports = {
  transform: {
    '\\.js$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  }
};