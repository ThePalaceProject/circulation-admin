var breadcrumbSelector = "ol.breadcrumb";
var loadingSelector = "h1.loading";
var nthBreadcrumbSelector = function(n) {
  return `ol.breadcrumb li:nth-child(${n})`
};

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
              .verify.elementNotPresent(nthBreadcrumbSelector(2));
          });
        });
      });
  },

  "navigate to book in lane and back": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";
    var bookTitleSelector = "h1.bookDetailsTitle";

    browser
      .goHome()
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
              .verify.elementNotPresent(nthBreadcrumbSelector(2));
          });
        });
      });
  },

  "navigate to book, click through tabs, refresh page, go back": function(browser) {
    var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";
    var bookTitleSelector = "h1.bookDetailsTitle";
    var editTabSelector = "ul.nav-tabs li:nth-child(2) a";
    var titleInputSelector = "input[name='title']";
    var classificationsTabSelector = "ul.nav-tabs li:nth-child(3) a";
    var genreInputSelector = "select[name='genre']";
    var complaintsTabSelector = "ul.nav-tabs li:nth-child(4) a";
    var complaintInputSelector = "select[name='type']";

    browser
      .goHome()
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
            .click(classificationsTabSelector)
            .waitForElementPresent(genreInputSelector, 5000)
            .verify.urlContains("tab=classifications")
            .click(complaintsTabSelector)
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab=complaints")
            .refresh()
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab=complaints")
            .verify.titleContains(bookTitle)
            .back()
            .back()
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

  "navigate to top-level pages": function(browser) {
    var laneSelector = "li:first-child .lane h2 a";
    var complaintsSelector = "ul.nav li:first-child a";
    var hiddenSelector = "ul.nav li:last-child a";

    browser
      .goHome()
      .getAttribute(complaintsSelector, "href", function(result) {
        var complaintsUrl = result.value;
        this.getText(complaintsSelector, function(result) {
          var complaintsTitle = result.value;
          this.getAttribute(hiddenSelector, "href", function(result) {
            var hiddenUrl = result.value
            this.getText(hiddenSelector, function(result) {
              var hiddenTitle = result.value;
              this.getText(laneSelector, function(result) {
                var laneTitle = result.value;
                this
                  .click(laneSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .waitForElementPresent(nthBreadcrumbSelector(2), 5000)
                  .assert.noError()
                  .verify.containsText(nthBreadcrumbSelector(1), "All Books")
                  .verify.containsText(nthBreadcrumbSelector(2), laneTitle)
                  .click(complaintsSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .assert.noError()
                  .assert.containsText(nthBreadcrumbSelector(1), "All Books")
                  .assert.containsText(nthBreadcrumbSelector(2), complaintsTitle)
                  .click(hiddenSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .assert.noError()
                  .assert.containsText(nthBreadcrumbSelector(1), "All Books")
                  .assert.containsText(nthBreadcrumbSelector(2), hiddenTitle);
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