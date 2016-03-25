/**
 * Asserts that no error exists in the DOM.
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.noError();
 *    };
 * ```
 *
 * @method noError
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

 var util = require('util');

 exports.assertion = function(msg) {
   this.message = msg || util.format('Testing if no error is present.');
   this.expected = 'not present';

   this.pass = function(value) {
     return value === null;
   };

   this.value = function(result) {
     var value = null;
     if (result.value.length !== 0) {
       value = 'present';
     }
     return value;
   };

   this.command = function(callback) {
     return this.api.elements(this.client.locateStrategy, ".error", callback);
   };
 };