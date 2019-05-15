// Page Object for a book page
module.exports = {
  elements: {
    // Elements found on each tab
    bookTitleSelector: ".book-details .title",
    titleInputSelector: "input[name='title']",
    genreInputSelector: "select[name='genre']",
    // 2nd child because the first is a label
    genreSecondOptionSelector: "select[name='genre'] option:nth-child(2)",
    coverInputSelector: "input[name='cover_url']",
    complaintInputSelector: "select[name='type']",
    listInputSelector: "input[name='list']",
    // Tab selectors
    detailsTabSelector: "ul.nav-tabs li:nth-child(1) a",
    editTabSelector: "ul.nav-tabs li:nth-child(2) a",
    classificationsTabSelector: "ul.nav-tabs li:nth-child(3) a",
    coverTabSelector: "ul.nav-tabs li:nth-child(4) a",
    complaintsTabSelector: "ul.nav-tabs li:nth-child(5) a",
    listsTabSelector: "ul.nav-tabs li:nth-child(6) a",
  }
};
