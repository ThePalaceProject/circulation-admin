/**
 * Checks if the page title contains the given value.
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.titleContains("Snorkeling");
 *    };
 * ```
 *
 * @method titleContains
 * @param {string} expected Text the page title is expected to contain.
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

var util = require('util');

exports.assertion = function(expected, msg) {
  this.message = msg || util.format('Testing if the page title contains "%s".', expected);
  this.expected = expected;

  this.pass = function(value) {
    return value.indexOf(this.expected) !== -1;
  };

  this.value = function(result) {
    return result.value;
  };

  this.command = function(callback) {
    this.api.title(callback);
    return this;
  };
};