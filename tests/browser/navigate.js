var globalBrowser;
var breadcrumbSelector = "ol.breadcrumb";

module.exports = {
  before: function(browser, done) {
    browser
      .signIn()
      .perform(function() {
        done();
      });
  },

  "navigate to lane and back": function(browser) {
    var laneSelector = "li:first-child .lane h2 a";

    browser
      .goHome()
      .waitForElementVisible(laneSelector, 5000)
      .waitForElementNotPresent(breadcrumbSelector, 5000)
      .verify.noError()
      .url(function(result) {
        var catalogUrl = result.value;
        this.getAttribute(laneSelector, "href", function(result) {
          var laneUrl = result.value;
          this.getText(laneSelector, function(result) {
            var laneTitle = result.value;
            this
              .click(laneSelector)
              .waitForElementNotPresent("h1.loading", 5000)
              .verify.noError()
              .verify.urlEquals(laneUrl)
              .verify.titleContains(laneTitle)
              .back()
              .waitForElementNotPresent("h1.loading", 5000)
              .verify.urlEquals(catalogUrl)
              .verify.elementNotPresent(breadcrumbSelector);
          });
        });
      });
  },

  "navigate to book in lane": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";

    browser
      .goHome()
      .waitForElementVisible(bookSelector, 5000)
      .waitForElementNotPresent(breadcrumbSelector, 5000)
      .verify.noError()
      .url(function(result) {
        var catalogUrl = result.value;
        this.getAttribute(bookSelector, "href", function(result) {
          var bookUrl = result.value;
          this.getText(bookSelector, function(result) {
            var bookTitle = result.value;
            this
              .click(bookSelector)
              .waitForElementPresent("h1.bookDetailsTitle", 5000)
              .verify.noError()
              .verify.urlEquals(bookUrl)
              .verify.titleContains(bookTitle)
              .verify.containsText("h1.bookDetailsTitle", bookTitle)
              .back()
              .waitForElementNotPresent("h1.loading", 5000)
              .verify.urlEquals(catalogUrl)
              .verify.elementNotPresent("h1.bookDetailsTitle")
              .verify.elementNotPresent(breadcrumbSelector);
          });
        });

      });
  },

  after: function(browser) {
    browser.end();
  }
};