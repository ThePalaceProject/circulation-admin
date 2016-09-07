var http = require("http");

module.exports = {
  "attempt to view a book before signing in": function(browser) {
    // before signing in, find a book url in the catalog feed
    http.get({
      host: "localhost",
      port: 6500,
      path: "/groups/"
    }, function(response) {
      var body = "";

      response.on("data", function(chunk) {
        body += chunk;
      });

      response.on("end", function() {
        var bookTitle = body.match(/<entry [\s\S]+?<title>([^<]+)<\/title>/i)[1];
        var link = body.match(/<link [^>]*rel="alternate[^>]+\/>/i)[0];
        var bookUrl = link.match(/href="([^"]+)"/)[1];
        var entryBaseUrl = browser.globals.homeUrl.replace("/admin/web/", "/works/");

        // transform the book url into an admin book url
        var adminBookUrl =
          browser.globals.homeUrl + "book/" +
          encodeURIComponent(
            bookUrl.replace(entryBaseUrl, "")
          );

        browser
          .url(adminBookUrl)
          .waitForElementVisible("input#Email", 1000)
          .assert.urlContains(encodeURIComponent("state=") + encodeURI(encodeURI(adminBookUrl)))
          .setValue("input#Email", browser.globals.username)
          .click("input#next")
          .waitForElementVisible("input#Passwd", 1000)
          .setValue("input#Passwd", browser.globals.password)
          .click("input#signIn")
          .waitForElementVisible("button#submit_approve_access:enabled", 10000)
          .click("button#submit_approve_access")
          .waitForElementVisible("nav", 1000)
          .assert.urlContains(adminBookUrl)
          .assert.containsText(".book-details .title", bookTitle);
      });
    });
  },

  after: function(browser) {
    browser.end();
  }
};