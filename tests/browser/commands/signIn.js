/**
 * @method signIn
 * @param {string} username The login form username.
 * @param {string} password The login form password.
 * @api command
 * @description This custom command uses the `login` page object to
 *  fill out the form.
 */
exports.command = function(username, password) {
  const login = this.page.login();

  return login
    .navigate()
    .waitForElementVisible("@username", 1000)
    .setValue("@username", username)
    .setValue("@password", password)
    .click("@submit")
};
