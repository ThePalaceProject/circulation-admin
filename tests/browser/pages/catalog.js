// Page Object for the catalog
module.exports = {
  elements: {
    loadingSelector: ".loading",
    laneSelector: "li:first-child .lane h2 a",
    bookSelector: ".lane-books li:first-child a",
    bookLinkTitleSelector: ".lane-books li:first-child a .title",
    catalogSelector: "ul.nav li:nth-child(1) a",
    complaintsSelector: "ul.nav li:nth-child(2) a",
    hiddenSelector: "ul.nav li:nth-child(3) a",
    dashboardSelector: "ul.nav li:nth-child(6) a",
    circulationLibraryStatsSelector: ".library-stats:nth-child(1) h2",
    circulationAllStatsSelector: ".library-stats:nth-child(2) h2",
    firstBookSelector: "li:nth-child(1) .book a",
    secondBookSelector: "li:nth-child(2) .book a",
  },
  commands: [
    {
      nthBreadcrumbSelector: function(n) {
        return `ol.breadcrumb li:nth-child(${n})`
      }
    }
  ]
};
