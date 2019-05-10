exports.command = function() {
  return this
    .url(this.globals.homeUrl)
    .waitForElementVisible("input[type=text]", 1000)
    .setValue("input[type=text]", this.globals.username)
    .click("input[type=password]")
    .waitForElementVisible("input[type=password]", 1000)
    .setValue("[type=password]", this.globals.password)
    .click("button[type=submit]")
    .waitForElementVisible("nav", 10000);
};
