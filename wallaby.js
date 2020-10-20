module.exports = function () {

  return {
    files: ['src/**/*.js', '!__tests__/*.js'],

    tests: ['__tests__/*.js'],

    env: {
      type: 'node'
    },

    delays: {
      run: 500
    },

    testFramework: 'jest'
  };
};
