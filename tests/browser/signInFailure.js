module.exports = {

  /**
   * The log in error page contains a simple message and a link to go back
   * to the log in page.
   */
  "go to the error page with bad log in credentials": (browser) => {
    const errorMessage = "p";
    const tryAgainButton = "a";

    browser
      .resizeWindow(1200, 900)
      .signIn("bad email", "bad password")
      .waitForElementVisible("body", 10000)
      .expect.element(errorMessage).text.to.contain("401 ERROR");
    
    browser
      .assert.attributeContains(tryAgainButton, "href", "/admin/sign_in");
    
    browser.end();
  }
};