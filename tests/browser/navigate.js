var globalBrowser;

module.exports = {
  before: function(browser, done) {
    globalBrowser = browser
      .signIn()
      .perform(function() {
        done();
      });
  },

  "navigate to lane": function(browser) {
    var laneSelector = "li:first-child .lane h2 a";

    globalBrowser
      .goHome()
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
      });
  },

  "navigate to book in lane": function(browser) {
    var bookSelector = "ul.laneBooks li:first-child a.laneBookLink";

    globalBrowser
      .goHome()
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
      });
  },

  after: function(browser) {
    globalBrowser.end();
  }
};