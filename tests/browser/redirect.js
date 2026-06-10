const http = require("follow-redirects").http;

const fetchGroupPage = () => {
  return new Promise((resolve, reject) => {
    http.get(
      {
        host: "localhost",
        port: 6500,
        path: "/groups/",
      },
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("error", (err) => {
          reject(err);
        });

        response.on("end", () => {
          resolve(body);
        });
      }
    );
  });
};
const getAdminListUrl = (body, browser) => {
  const listBaseUrl = `${browser.globals.homeUrl}lists`;
  const id = body.match(/<id>[\s\S]+?<\/id>/i)[0];
  const libraryName = id.match(/\/[\w]+/i)[0]; // includes forward slash

  return `${listBaseUrl}${libraryName}`;
};
let body;
let loginPage;
let loadingSelector;

module.exports = {
  beforeEach: (browser, done) => {
    loginPage = browser.page.login();
    loadingSelector = browser.page.catalog().elements.loadingSelector;

    fetchGroupPage(browser).then((data) => {
      body = data;
      done();
    });
  },

  "attempt to view the admin list page before signing in": (browser) => {
    const adminListUrl = getAdminListUrl(body, browser);
    const { username, password, submit } = loginPage.elements;

    // Go to the admin list page, get redirected to the login page with the
    // redirect in the url, log in successfully, then go to the admin list page
    browser
      .url(adminListUrl)
      .waitForElementVisible(username, 1000)
      .assert.urlContains("redirect=" + encodeURIComponent(adminListUrl))
      .setValue(username, browser.globals.username)
      .setValue(password, browser.globals.password)
      .click(submit)
      .waitForElementVisible(loadingSelector, 1000)
      .assert.urlContains(adminListUrl);
  },

  // TODO: Update once flask has been updated on the server
  // "attempt to view a book page before signing in": (browser) => {
  //   const { adminBookUrl, bookTitle }  = getAdminBookUrlAndTitle(body, browser);
  //   const { username, password, submit } = loginPage.elements;
  //   const { bookTitleSelector } = browser.page.book().elements;

  //   browser
  //     .url(adminBookUrl)
  //     .waitForElementVisible(username, 1000)
  //     .verify.urlContains("redirect=" + encodeURIComponent(adminBookUrl))
  //     .setValue(username, browser.globals.username)
  //     .setValue(password, browser.globals.password)
  //     .click(submit)
  //     .waitForElementVisible(loadingSelector, 1000)
  //     .verify.containsText(bookTitleSelector, bookTitle)
  //     .assert.urlContains(adminBookUrl);
  // },

  afterEach: (browser) => {
    browser.end();
  },
};
