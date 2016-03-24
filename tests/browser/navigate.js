signIn = require("./lib/signIn");

module.exports = {
  "navigate to lane" : function (browser) {
    signIn(browser)
      .waitForElementVisible("li:first-child .lane h2 a", 1000)
      .getAttribute("li:first-child .lane h2 a", "href", function(result) {
        var laneUrl = result.value;
        this
          .click("li:first-child .lane h2 a")
          .url(function(result) {
            browser.assert.equal(result.value, laneUrl);
          });
      })
      .end();
  }
};