var http = require('follow-redirects').http

module.exports = {
  "attempt to view a book before signing in": async function(browser) {
    // before signing in, find a book url in the catalog feed
    var { adminBookUrl, bookTitle } = await new Promise(function(resolve, reject) {
      http.get({
        host: "localhost",
        port: 6500,
        path: "/groups/"
      }, function(response) {
        var body = "";

        response.on("data", function(chunk) {
          body += chunk;
        });

        response.on("error", function(err) {
          reject(err);
        });

        response.on("end", function() {
          var bookTitle = body.match(/<entry [\s\S]+?<title>([^<]+)<\/title>/i)[1];
          var link = body.match(/<link [^>]*rel="alternate[^>]+\/>/i)[0];
          var id = body.match(/<id>[\s\S]+?<\/id>/i)[0];
          var lib = id.match(/\/[\w]+/i)[0]; // /libname
          var bookUrl = link.match(/href="([^"]+)"/)[1];
          var entryBaseUrl = browser.globals.homeUrl.replace("/admin/web/", lib + "/works");

          // transform the book url into an admin book url
          var adminBookUrl =
            browser.globals.homeUrl + "collection" + lib + "/book" + lib;
            encodeURIComponent(
              bookUrl.replace(entryBaseUrl, "")
            );

          resolve({ adminBookUrl, bookTitle });
        });
      });
    });

    browser
      .url(adminBookUrl)
      .waitForElementVisible("input[type=text]", 1000)
      .assert.urlContains("redirect=" + encodeURIComponent(adminBookUrl))
      .setValue("input[type=text]", browser.globals.username)
      .click("input[type=password]")
      .waitForElementVisible("input[type=password]", 1000)
      .setValue("input[type=password]", browser.globals.password)
      .click("button[type=submit]")
      // .waitForElementVisible("button#submit_approve_access:enabled", 10000)
      // .click("button#submit_approve_access")
      .waitForElementVisible("nav", 1000)
      .assert.urlContains(adminBookUrl);
      // .assert.containsText(".book-details .title", bookTitle);
  },

  after: function(browser) {
    browser.end();
  }
};