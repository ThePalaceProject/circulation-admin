signIn = require("./lib/signIn");

module.exports = {
  "navigate to lane" : function(browser) {
    var laneSelector = "li:first-child .lane h2 a";

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
  },
  "navigate to book in lane": function(browser) {
    var bookSelector = "ul.laneBooks li:first-child a.laneBookLink";

    signIn(browser)
      .waitForElementVisible(bookSelector, 1000)
      .getAttribute(bookSelector, "href", function(result) {
        var bookUrl = result.value;
        this.getText(bookSelector, function(result) {
          var bookTitle = result.value;
          this
            .click(bookSelector)
            .waitForElementPresent("h1.bookDetailsTitle", 2000)
            .assert.urlEquals(bookUrl)
            .assert.titleContains(bookTitle);
          this.expect.element("h1.bookDetailsTitle").text.to.equal(bookTitle);
        });
      })
      .end();
  }
};