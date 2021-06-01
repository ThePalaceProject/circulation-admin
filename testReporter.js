var mocha = require('mocha');
var sinon = require('sinon');
var color = require('colors-cli/safe');
module.exports = TestReporter;

function TestReporter(runner) {
  // This isn't the place for warnings about soon-to-be-deprecated React methods, etc; we just want a clean list.
  console.warn = sinon.stub();
  console.error = sinon.stub();

  const {
    EVENT_SUITE_BEGIN,
    EVENT_TEST_BEGIN,
    EVENT_SUITE_END
  } = mocha.Runner.constants;

  mocha.reporters.Base.call(this, runner);

  runner.on(EVENT_SUITE_BEGIN, function(suite) {
    console.group(color.x25.bold(suite.title));
  });
  runner.on(EVENT_TEST_BEGIN, function(test) {
    console.log(test.title);
  });
  runner.on(EVENT_SUITE_END, function() {
    console.groupEnd();
  });
}
