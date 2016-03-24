module.exports = function(browser) {
  return browser
    .url("http://localhost:6500/admin/")
    .waitForElementVisible("input#Email", 1000)
    .setValue("input#Email", "librarysimplifiedtesting")
    .click("input#next")
    .waitForElementVisible("input#Passwd", 1000)
    .setValue("input#Passwd", "seas37?spays")
    .click("input#signIn")
    .waitForElementVisible("button#submit_approve_access:enabled", 2000)
    .click("button#submit_approve_access")
    .waitForElementVisible("nav", 2000);
}