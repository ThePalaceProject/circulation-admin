var bookSelector = "li:first-child .lane ul.laneBooks li:first-child a.laneBookLink";

exports.command = function() {
  return this
    .url(this.globals.homeUrl)
    .waitForElementVisible(bookSelector, 5000)
    .waitForElementNotPresent("ol.breadcrumb li:nth-child(2)", 5000)
    .verify.noError();
};