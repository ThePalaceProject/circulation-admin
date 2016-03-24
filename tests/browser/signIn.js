var signIn = require("./lib/signIn");

module.exports = {
  "sign in" : function (browser) {
    signIn(browser)
      .assert.containsText("nav .navbar-brand", "NYPL")
      .end();
  }
};