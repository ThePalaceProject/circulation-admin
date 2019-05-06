const breadcrumbSelector = "ol.breadcrumb";
let loadingSelector;
let catalogPage;
let bookPage;

module.exports = {
  /**
   * Before any tests run, log in with the correct credentials.
   */
  before: function(browser, done) {
    const { username, password } = browser.globals;
    catalogPage = browser.page.catalog();
    bookPage = browser.page.book();
    loadingSelector = catalogPage.elements.loadingSelector;

    browser
      .resizeWindow(1200, 900)
      .signIn(username, password)
      .perform(function() {
        done();
      });
  },

  "navigate to the first lane and back": function(browser) {
    const { laneSelector } = catalogPage.elements;
    const { nthBreadcrumbSelector } = catalogPage;

    browser
      .goHome()
      .url(function(result) {
        let catalogUrl = result.value;
        this.getAttribute(laneSelector, "href", function(result) {
          let laneUrl = result.value;
          this.getText(laneSelector, function(laneText) {
            let laneTitle = laneText.value;

            this.click(laneSelector)
              .waitForElementNotPresent(loadingSelector, 5000)
              .verify.noError()
              .verify.urlEquals(laneUrl)
              .verify.titleContains(laneTitle)
              // when a lane selector is clicked, we go into another
              // navigation level
              .verify.elementPresent(nthBreadcrumbSelector(3))
              .back()
              .waitForElementNotPresent(loadingSelector, 5000)
              .verify.urlEquals(catalogUrl)
              .verify.elementNotPresent(nthBreadcrumbSelector(3));
          });
        });
      });
  },

  "navigate to the first book in the first lane and back": function(browser) {
    const {
      bookSelector,
      bookLinkTitleSelector
    } = catalogPage.elements;
    const { bookTitleSelector } = bookPage.elements;

    browser
      .goHome()
      .url(function(result) {
        let catalogUrl = result.value;
        this.getAttribute(bookSelector, "href", function(result) {
          let bookUrl = result.value;
          this.getText(bookLinkTitleSelector, function(result) {
            let bookTitle = result.value;
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
              .verify.elementNotPresent(bookTitleSelector);
          });
        });
      });
  },

  "navigate to the first book, click through tabs, refresh page, go back": function(browser) {
    const { bookSelector } = catalogPage.elements;
    const {
      bookTitleSelector,
      titleInputSelector,
      genreInputSelector,
      coverInputSelector,
      complaintInputSelector,
      editTabSelector,
      classificationsTabSelector,
      coverTabSelector,
      complaintsTabSelector
    } = bookPage.elements;

    browser
      .goHome()
      .getAttribute(bookSelector, "href", function(result) {
        let bookUrl = result.value;
        this.getAttribute(bookSelector, "title", function(result) {
          let bookTitle = result.value;
          this
            .click(bookSelector)
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.noError()
            .verify.urlEquals(bookUrl)
            .verify.containsText(bookTitleSelector, bookTitle)
            
            // go to the edit tab
            .click(editTabSelector)
            .waitForElementPresent(titleInputSelector, 5000)
            .verify.urlContains("tab/edit")
            .verify.value(titleInputSelector, bookTitle)
            
            // go to the classifications tab
            .click(classificationsTabSelector)
            .waitForElementPresent(genreInputSelector, 5000)
            .verify.urlContains("tab/classifications")
            
            // go to the image cover tab
            .click(coverTabSelector)
            .waitForElementPresent(coverInputSelector, 5000)
            .verify.urlContains("tab/cover")
            
            // go to the complaints tab
            .click(complaintsTabSelector)
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab/complaints")
            .refresh()
            .waitForElementPresent(complaintInputSelector, 5000)
            .verify.urlContains("tab/complaints")
            .verify.titleContains(bookTitle)
            
            // go back to the cover tab
            .back()
            // go back to the classifications tab
            .back()
            // go back to the edit tab
            .back()
            // go back to the main details tab
            .back()
            .waitForElementPresent(bookTitleSelector, 5000)
            .verify.urlEquals(bookUrl);
        });
      });
  },

  "navigate to top-level feeds": function(browser) {
    const {
      laneSelector,
      complaintsSelector,
      hiddenSelector
    } = catalogPage.elements;
    const { nthBreadcrumbSelector } = catalogPage;

    browser
      .goHome()
      .getAttribute(complaintsSelector, "href", function(result) {
        let complaintsUrl = result.value;
        this.getText(complaintsSelector, function(result) {
          let complaintsTitle = result.value;
          this.getAttribute(hiddenSelector, "href", function(result) {
            let hiddenUrl = result.value
            this.getText(hiddenSelector, function(result) {
              let hiddenTitle = result.value;
              this.getText(laneSelector, function(result) {
                let laneTitle = result.value;
                this
                  // go to the first lane
                  .click(laneSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .waitForElementPresent(nthBreadcrumbSelector(2), 5000)
                  .assert.noError()
                  .verify.containsText(nthBreadcrumbSelector(1), "All Books")
                  .verify.containsText(nthBreadcrumbSelector(2), "Book")
                  .verify.containsText(nthBreadcrumbSelector(3), laneTitle)

                  // go to the complaints page
                  .click(complaintsSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .assert.noError()
                  .assert.containsText(nthBreadcrumbSelector(1), "All Books")
                  .assert.containsText(nthBreadcrumbSelector(2), complaintsTitle)
                  .verify.urlEquals(complaintsUrl)

                  // go to the hidden books page
                  .click(hiddenSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .assert.noError()
                  .assert.containsText(nthBreadcrumbSelector(1), "All Books")
                  .assert.containsText(nthBreadcrumbSelector(2), hiddenTitle)
                  .verify.urlEquals(hiddenUrl);
              });
            });
          });
        });
      });
  },

  "navigate to dashboard and back to catalog": function(browser) {
    const {
      catalogSelector,
      dashboardSelector,
      circulationLibraryStatsSelector,
      circulationAllStatsSelector,
    } = catalogPage.elements;
    const { nthBreadcrumbSelector } = catalogPage;
    
    browser
      .goHome()
      .getAttribute(nthBreadcrumbSelector(1), "title", function(result) {
        let libraryName = result.value;
        this.getAttribute(catalogSelector, "href", function(result) {
          let catalogUrl = result.value;
            this.getAttribute(dashboardSelector, "href", function(result) {
            let dashboardUrl = result.value
            this
              // go to the dashboard
              .click(dashboardSelector)
              .waitForElementNotPresent(loadingSelector, 5000)
              .assert.noError()
              .verify.elementPresent(circulationLibraryStatsSelector)
              .verify.elementPresent(circulationAllStatsSelector)
              .verify.titleContains("Circulation Manager - Dashboard")

              // click the main navigation link
              .click(catalogSelector)
              .waitForElementNotPresent(loadingSelector, 5000)
              .assert.noError()
              .verify.elementPresent(nthBreadcrumbSelector(1))
              .verify.urlEquals(catalogUrl)
              .verify.titleContains(`Circulation Manager - ${libraryName}`);
          });
        });
      });
  },

  "navigate to two different book classifications tabs": function(browser) {
    const {
      laneSelector,
      firstBookSelector,
      secondBookSelector
    } = catalogPage.elements;
    const {
      bookTitleSelector,
      classificationsTabSelector,
      genreSecondOptionSelector
    } = bookPage.elements;
    const { nthBreadcrumbSelector } = catalogPage;

    browser
      .goHome()
      .click(laneSelector)
      .waitForElementNotPresent(loadingSelector, 5000)
      .waitForElementPresent(nthBreadcrumbSelector(2), 5000)

      // go to the first book
      .click(firstBookSelector)
      .waitForElementNotPresent(loadingSelector, 5000)
      .waitForElementPresent(bookTitleSelector, 5000)
      .getText(bookTitleSelector, function(result) {
        let firstTitle = result.value;

        this
          // go to the classifications tab
          .click(classificationsTabSelector)
          .waitForElementNotPresent(loadingSelector, 5000)
          .waitForElementPresent(genreSecondOptionSelector, 5000)
          .getText(genreSecondOptionSelector, function(result) {
            let firstGenre = result.value;

            this
              // go back to the catalog
              .click(nthBreadcrumbSelector(1))
              .waitForElementNotPresent(loadingSelector, 5000)
              .waitForElementPresent(secondBookSelector, 5000)

              // go to the second book
              .click(secondBookSelector)
              .waitForElementNotPresent(loadingSelector, 5000)
              .waitForElementPresent(bookTitleSelector, 50000)

              // making sure that we are on a new book
              .getText(bookTitleSelector, function(result) {
                let secondTitle = result.value;
                this.assert.notEqual(firstTitle, secondTitle);
                this
                  .click(classificationsTabSelector)
                  .waitForElementNotPresent(loadingSelector, 5000)
                  .waitForElementPresent(genreSecondOptionSelector, 5000)
                  .getText(genreSecondOptionSelector, function(result) {
                    let secondGenre = result.value;
                    this.assert.notEqual(firstGenre, secondGenre);
                  });
              });
          });
      });
  },

  /**
   * Correctly end the selenium server and tests
   */
  after: function(browser) {
    browser.end();
  }
};