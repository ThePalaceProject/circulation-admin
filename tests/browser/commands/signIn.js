exports.command = function() {
  return this
    .goHome()
    .waitForElementVisible("input#Email", 1000)
    .setValue("input#Email", this.globals.username)
    .click("input#next")
    .waitForElementVisible("input#Passwd", 1000)
    .setValue("input#Passwd", this.globals.password)
    .click("input#signIn")
    .waitForElementVisible("button#submit_approve_access:enabled", 10000)
    .click("button#submit_approve_access")
    .waitForElementVisible("nav", 10000);
};