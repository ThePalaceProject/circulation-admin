var bookSelector = ".lane-books li:first-child a";

/**
 * @method goHome
 * @api command
 * @description This custom command navigates the user to the home page.
 */
exports.command = function() {
  return this
    .url(this.globals.homeUrl)
    .waitForElementVisible(bookSelector, 5000)
    .verify.noError();
};
