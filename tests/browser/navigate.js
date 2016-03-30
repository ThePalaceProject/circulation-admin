var breadcrumbSelector = "ol.breadcrumb";
var loadingSelector = "h1.loading";

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
              .waitForElementNotPresent(loadingSelector, 5000)
              .verify.noError()
              .verify.urlEquals(laneUrl)
              .verify.titleContains(laneTitle)
              .back()
              .waitForElementNotPresent(loadingSelector, 5000)
              .verify.urlEquals(catalogUrl)
              .verify.elementNotPresent(breadcrumbSelector);
          });
        });
      });
  },

  "navigate to book in lane and back": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";
    var bookTitleSelector = "h1.bookDetailsTitle";

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
              .waitForElementPresent(bookTitleSelector, 5000)
              .verify.noError()
              .verify.urlEquals(bookUrl)
              .verify.titleContains(bookTitle)
              .verify.containsText(bookTitleSelector, bookTitle)
              .back()
              .waitForElementNotPresent(loadingSelector, 5000)
              .verify.urlEquals(catalogUrl)
              .verify.elementNotPresent(bookTitleSelector)
              .verify.elementNotPresent(breadcrumbSelector);
          });
        });

      });
  },

  after: function(browser) {
    browser.end();
  }
};