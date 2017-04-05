var breadcrumbSelector = "ol.breadcrumb";
var loadingSelector = ".loading";
var nthBreadcrumbSelector = function(n) {
  return `ol.breadcrumb li:nth-child(${n})`
};

module.exports = {
  before: function(browser, done) {
    browser
      .resizeWindow(1200, 900)
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
    var bookSelector = ".lane-books li:first-child a";
    var bookLinkTitleSelector = bookSelector + " .title";
    var bookTitleSelector = ".book-details .title";

    browser
      .goHome()
      .url(function(result) {
        var catalogUrl = result.value;
        this.getAttribute(bookSelector, "href", function(result) {
          var bookUrl = result.value;
          this.getText(bookLinkTitleSelector, function(result) {
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
    var bookSelector = ".lane-books li:first-child a";
    var bookTitleSelector = ".book-details .title";
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
        this.getAttribute(bookSelector, "title", function(result) {
          var bookTitle = result.value;
          this
            .click(bookSelector)
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.noError()
            .verify.urlEquals(bookUrl)
            .verify.containsText(bookTitleSelector, bookTitle)
            .click(editTabSelector)
            .waitForElementPresent(titleInputSelector, 5000)
            .verify.urlContains("tab/edit")
            .verify.value(titleInputSelector, bookTitle)
            .click(classificationsTabSelector)
            .waitForElementPresent(genreInputSelector, 5000)
            .verify.urlContains("tab/classifications")
            .click(complaintsTabSelector)
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab/complaints")
            .refresh()
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab/complaints")
            .verify.titleContains(bookTitle)
            .back()
            .back()
            .back()
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.urlEquals(bookUrl);
        });
      });
  },

  "navigate to top-level feeds": function(browser) {
    var laneSelector = "li:first-child .lane h2 a";
    var complaintsSelector = "ul.nav li:nth-child(2) a";
    var hiddenSelector = "ul.nav li:nth-child(3) a";

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

  "navigate to dashboard and back to catalog": function(browser) {
    var catalogSelector = "ul.nav li:nth-child(1) a";
    var dashboardSelector = "ul.nav li:nth-child(4) a";
    var circulationEventsSelector = ".circulation-events h3";

    browser
      .goHome()
      .getAttribute(catalogSelector, "href", function(result) {
        var catalogUrl = result.value;
          this.getAttribute(dashboardSelector, "href", function(result) {
          var dashboardUrl = result.value
          this
            .click(dashboardSelector)
            .waitForElementNotPresent(loadingSelector, 5000)
            .assert.noError()
            .verify.elementPresent(circulationEventsSelector)
            .verify.titleContains("Circulation Manager - Dashboard")
            .click(catalogSelector)
            .waitForElementNotPresent(loadingSelector, 5000)
            .assert.noError()
            .verify.elementPresent(nthBreadcrumbSelector(1))
            .verify.titleContains("Circulation Manager - All Books");
        });
      });
  },

  "navigate to two different book classifications tabs": function(browser) {
    var laneSelector = "li:first-child .lane h2 a";
    var firstBookSelector = "li:nth-child(2) .book a .title";
    var secondBookSelector = "li:nth-child(3) .book a .title";
    var bookTitleSelector = ".book-details .title";
    var classificationsTabSelector = "ul.nav-tabs li:nth-child(3) a";
    var genreSelector = ".book-genre:nth-child(2) .book-genre-name"; // 2nd child because first is a label

    browser
      .goHome()
      .click(laneSelector)
      .waitForElementNotPresent(loadingSelector, 5000)
      .waitForElementPresent(nthBreadcrumbSelector(2), 5000)
      .click(firstBookSelector)
      .waitForElementNotPresent(loadingSelector, 5000)
      .waitForElementPresent(bookTitleSelector, 5000)
      .getText(bookTitleSelector, function(result) {
        var firstTitle = result.value;
        this
          .click(classificationsTabSelector)
          .waitForElementNotPresent(loadingSelector, 5000)
          .waitForElementPresent(genreSelector, 5000)
          .getText(genreSelector, function(result) {
            var firstGenre = result.value;
            this
              .click(nthBreadcrumbSelector(2))
              .waitForElementNotPresent(loadingSelector, 5000)
              .waitForElementPresent(secondBookSelector, 5000)
              .click(secondBookSelector)
              .waitForElementNotPresent(loadingSelector, 5000)
              .waitForElementPresent(bookTitleSelector, 50000)
              .getText(bookTitleSelector, function(result) {
                var secondTitle = result.value;
                this.assert.notEqual(firstTitle, secondTitle);
                this
                  .click(classificationsTabSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .waitForElementPresent(genreSelector, 5000)
                  .getText(genreSelector, function(result) {
                    var secondGenre = result.value;
                    this.assert.notEqual(firstGenre, secondGenre);
                  });
              });
          });
      });
  },

  after: function(browser) {
    browser.end();
  }
};