// Page Object for the login page
module.exports = {
  url: function() {
    return this.api.globals.homeUrl;
  },
  elements: {
    username: "input[type='text']",
    password: "input[type='password']",
    submit: "button[type='submit']"
  }
};
