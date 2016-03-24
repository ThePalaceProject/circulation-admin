signIn = require("./lib/signIn");

module.exports = {
  "navigate to lane" : function (browser) {
    var laneSelector = "li:first-child .lane h2 a";
    var homeTitle;

    signIn(browser)
      .waitForElementVisible(laneSelector, 1000)
      .getAttribute(laneSelector, "href", function(result) {
        var laneUrl = result.value;
        this.getText(laneSelector, function(result) {
          var laneTitle = result.value;
          this
            .click(laneSelector)
            .waitForElementNotPresent("h1.loading", 2000)
            .assert.urlEquals(laneUrl)
            .assert.titleContains(laneTitle);
        });
      })
      .end();
  }
};