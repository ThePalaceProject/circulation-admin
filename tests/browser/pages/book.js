// Page Object for a book page
module.exports = {
  elements: {
    bookTitleSelector: ".book-details .title",
    titleInputSelector: "input[name='title']",
    genreInputSelector: "select[name='genre']",
    coverInputSelector: "input[name='cover_url']",
    complaintInputSelector: "select[name='type']",
    editTabSelector: "ul.nav-tabs li:nth-child(2) a",
    classificationsTabSelector: "ul.nav-tabs li:nth-child(3) a",
    coverTabSelector: "ul.nav-tabs li:nth-child(4) a",
    complaintsTabSelector: "ul.nav-tabs li:nth-child(5) a",
    // 2nd child because the first is a label
    genreSecondOptionSelector: "select[name='genre'] option:nth-child(2)"
  }
};
