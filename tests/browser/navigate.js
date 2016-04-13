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

  "navigate to book, click edit tab, refresh page, go back": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";
    var bookTitleSelector = "h1.bookDetailsTitle";
    var editTabSelector = "ul.nav-tabs li:nth-child(2) a";
    var titleInputSelector = "input[name='title']";

    browser
      .goHome()
      .waitForElementVisible(bookSelector, 5000)
      .waitForElementNotPresent(breadcrumbSelector, 5000)
      .verify.noError()
      .getAttribute(bookSelector, "href", function(result) {
        var bookUrl = result.value;
        this.getText(bookSelector, function(result) {
          var bookTitle = result.value;
          this
            .click(bookSelector)
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.noError()
            .verify.urlEquals(bookUrl)
            .verify.containsText(bookTitleSelector, bookTitle)
            .click(editTabSelector)
            .waitForElementPresent(titleInputSelector, 5000)
            .verify.urlContains("tab=edit")
            .verify.value(titleInputSelector, bookTitle)
            .refresh()
            .waitForElementPresent(titleInputSelector, 5000)
            .verify.urlContains("tab=edit")
            .verify.titleContains(bookTitle)
            .back()
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.urlEquals(bookUrl);
        });
      });
  },

  "navigate to book, press left and right keys": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";
    var nextBookSelector = "li:first-child .lane ul.laneBooks li:nth-child(2) a.laneBookLink";
    var prevBookSelector = "li:last-child .lane ul.laneBooks li:last-child a.laneBookLink";
    var bookTitleSelector = "h1.bookDetailsTitle";
    var editTabSelector = "ul.nav-tabs li:nth-child(2) a";
    var titleInputSelector = "input[name='title']";

    browser
      .goHome()
      .waitForElementVisible(bookSelector, 5000)
      .waitForElementNotPresent(breadcrumbSelector, 5000)
      .verify.noError()
      .getAttribute(bookSelector, "href", function(result) {
        var bookUrl = result.value;
        this.getText(bookSelector, function(result) {
          var bookTitle = result.value;
          this.getAttribute(nextBookSelector, "href", function(result) {
            var nextBookUrl = result.value;
            this.getText(nextBookSelector, function(result) {
              var nextBookTitle = result.value;
              this.getAttribute(prevBookSelector, "href", function(result) {
                var prevBookUrl = result.value;
                this.getText(prevBookSelector, function(result) {
                  var prevBookTitle = result.value;
                  this
                    .click(bookSelector)
                    .verify.noError()
                    .verify.urlEquals(bookUrl)
                    .verify.containsText(bookTitleSelector, bookTitle)
                    .keys(browser.Keys.RIGHT_ARROW)
                    .verify.urlEquals(nextBookUrl)
                    .verify.containsText(bookTitleSelector, nextBookTitle)
                    .click(editTabSelector)
                    .waitForElementPresent(titleInputSelector, 5000)
                    .waitForElementNotPresent(".fa-spinner", 5000)
                    .verify.value(titleInputSelector, nextBookTitle)
                    .keys(browser.Keys.LEFT_ARROW)
                    .verify.urlEquals(bookUrl)
                    .verify.containsText(bookTitleSelector, bookTitle)
                    .keys(browser.Keys.LEFT_ARROW)
                    .verify.urlEquals(prevBookUrl)
                    .verify.containsText(bookTitleSelector, prevBookTitle)
                    .click(editTabSelector)
                    .waitForElementPresent(titleInputSelector, 5000)
                    .waitForElementNotPresent(".fa-spinner", 5000)
                    .pause(50)
                    .verify.value(titleInputSelector, prevBookTitle)
                });
              });
            });
          });
        });
      });
  },

  after: function(browser) {
    browser.end();
  }
};